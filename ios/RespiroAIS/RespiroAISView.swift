//
//  RespiroAISView.swift
//  APRENS · Silueta AIS con las dos luces (aire azul · atención amarilla)
//
//  Embebe el componente web compartido del ecosistema APRENS
//  (RespiroAIS.bundle: index.html + js/respiro-ais.js + assets/respiro/organismo.webp)
//  en un WKWebView, 100 % offline, con puente JS↔Swift:
//    · Swift → JS: empezar / parar / idioma / resaltar zona.
//    · JS → Swift: zona tocada (cuello · pecho · barriga), ciclo completado, listo.
//
//  Uso mínimo (sustituye a Image("ais_internal_attention")):
//
//      @State private var running = false
//      @State private var zona: RespiroAISView.Zone? = nil
//
//      RespiroAISView(running: $running, onZone: { zona = $0 })
//          .aspectRatio(1024.0 / 1536.0, contentMode: .fit)
//          .frame(maxWidth: 360)
//
//  Requisitos: iOS 14+ (WebP en WKWebView), carpeta RespiroAIS.bundle añadida al
//  target como *folder reference* (carpeta azul) para conservar las rutas js/ y assets/.
//

import SwiftUI
import WebKit

struct RespiroAISView: UIViewRepresentable {

    enum Zone: String { case cuello, pecho, barriga }

    struct Rhythm {
        var inhale = 4000, anchor = 2000, exhale = 6000, pause = 1500   // ms · ritmo de referencia 4·2·6
        static let reference = Rhythm()
    }

    /// Animación en marcha (las dos luces). Cambia la variable para empezar/parar desde Swift.
    @Binding var running: Bool
    var lang: String = "es"
    var rhythm: Rhythm = .reference
    /// Botón «Empezar/Parar» propio del componente (normalmente lo pone la app nativa).
    var showControl: Bool = false
    var onZone: ((Zone) -> Void)? = nil
    var onCycle: ((Int) -> Void)? = nil
    var onReady: (() -> Void)? = nil

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.userContentController.add(context.coordinator, name: "respiro")

        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = context.coordinator
        web.isOpaque = false
        web.backgroundColor = .clear
        web.scrollView.backgroundColor = .clear
        web.scrollView.isScrollEnabled = false
        web.scrollView.bounces = false
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.allowsLinkPreview = false
        web.allowsBackForwardNavigationGestures = false
        #if DEBUG
        if #available(iOS 16.4, *) { web.isInspectable = true }
        #endif

        if let url = Self.bundleIndexURL(), let dir = Self.bundleDirURL() {
            var comps = URLComponents(url: url, resolvingAgainstBaseURL: false)!
            comps.queryItems = [
                URLQueryItem(name: "lang", value: lang),
                URLQueryItem(name: "control", value: showControl ? "1" : "0"),
                URLQueryItem(name: "inhale", value: String(rhythm.inhale)),
                URLQueryItem(name: "anchor", value: String(rhythm.anchor)),
                URLQueryItem(name: "exhale", value: String(rhythm.exhale)),
                URLQueryItem(name: "pause", value: String(rhythm.pause)),
            ]
            web.loadFileURL(comps.url!, allowingReadAccessTo: dir)
        } else {
            assertionFailure("RespiroAIS.bundle no está en el target (añádelo como folder reference).")
        }
        return web
    }

    func updateUIView(_ web: WKWebView, context: Context) {
        context.coordinator.parent = self
        context.coordinator.sync(web)
    }

    static func dismantleUIView(_ web: WKWebView, coordinator: Coordinator) {
        web.configuration.userContentController.removeScriptMessageHandler(forName: "respiro")
        web.evaluateJavaScript("window.respiro && respiro.stop()", completionHandler: nil)
    }

    // MARK: - Localización del bundle (carpeta azul "RespiroAIS.bundle")
    static func bundleDirURL() -> URL? {
        if let u = Bundle.main.url(forResource: "RespiroAIS", withExtension: "bundle") { return u }
        return Bundle.main.resourceURL?.appendingPathComponent("RespiroAIS.bundle")
    }
    static func bundleIndexURL() -> URL? {
        guard let dir = bundleDirURL() else { return nil }
        let u = dir.appendingPathComponent("index.html")
        return FileManager.default.fileExists(atPath: u.path) ? u : nil
    }

    // MARK: - Coordinator (puente)
    final class Coordinator: NSObject, WKScriptMessageHandler, WKNavigationDelegate {
        var parent: RespiroAISView
        private var ready = false
        private var lastRunning: Bool? = nil
        private var lastLang: String? = nil

        init(_ parent: RespiroAISView) { self.parent = parent }

        /// Aplica el estado de Swift al componente (idempotente).
        func sync(_ web: WKWebView) {
            guard ready else { return }
            if lastRunning != parent.running {
                lastRunning = parent.running
                web.evaluateJavaScript(parent.running ? "respiro.start()" : "respiro.stop()", completionHandler: nil)
            }
            if lastLang != parent.lang {
                lastLang = parent.lang
                web.evaluateJavaScript("respiro.setLang('\(parent.lang == "en" ? "en" : "es")')", completionHandler: nil)
            }
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            // El HTML envía {type:"ready"} al montar; por si llegara antes, sincronizamos también aquí.
            ready = true
            sync(webView)
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "respiro", let body = message.body as? [String: Any], let type = body["type"] as? String else { return }
            switch type {
            case "ready":
                ready = true
                if let web = message.webView { sync(web) }
                parent.onReady?()
            case "zone":
                if let z = body["zone"] as? String, let zone = Zone(rawValue: z) { parent.onZone?(zone) }
            case "cycle":
                if let n = body["n"] as? Int { parent.onCycle?(n) }
            default: break
            }
        }
    }
}

// MARK: - Ejemplo de pantalla «Sesión AIS» con la silueta viva
//
// Reemplaza la imagen estática por la silueta animada y conserva la lógica de
// anclaje por zonas: el usuario toca cuello / pecho / barriga y la app recibe la zona.
struct SesionAISExample: View {
    @State private var running = true
    @State private var zona: RespiroAISView.Zone? = nil
    @State private var ciclos = 0

    var body: some View {
        VStack(spacing: 14) {
            Text("Sesión AIS").font(.title2.bold()).frame(maxWidth: .infinity, alignment: .leading)

            RespiroAISView(
                running: $running,
                onZone: { zona = $0 },
                onCycle: { ciclos = $0 }
            )
            .aspectRatio(1024.0 / 1536.0, contentMode: .fit)
            .frame(maxWidth: 360)
            .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))

            Text(zona.map { "Anclaje: \($0.rawValue.capitalized)" } ?? "Pulsa sobre la silueta (cuello, pecho o barriga).")
                .font(.footnote).foregroundStyle(.secondary)

            HStack {
                Button(running ? "Parar" : "Empezar") { running.toggle() }
                    .buttonStyle(.borderedProminent)
                Text(ciclos > 0 ? "\(ciclos) respiraciones" : "").font(.footnote).foregroundStyle(.secondary)
            }
        }
        .padding()
    }
}

#if DEBUG
struct SesionAISExample_Previews: PreviewProvider {
    static var previews: some View { SesionAISExample() }
}
#endif
