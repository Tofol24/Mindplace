#!/usr/bin/env bash
# Aplica los arreglos conocidos de Capacitor 6 + Xcode 16/26 sobre el proyecto iOS.
# Ejecútalo desde la raíz del repo DESPUÉS de `npm --prefix native install` / `cap add ios`
# y ANTES de compilar:  bash native/fix-capacitor-xcode.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IOS="$ROOT/native/ios/App"
NM="$ROOT/native/node_modules"

echo "▸ 1/2  Parche: import que falta en CAPBridgeViewController+CDVScreenOrientationDelegate.h"
HDR="$NM/@capacitor/ios/Capacitor/Capacitor/CAPBridgeViewController+CDVScreenOrientationDelegate.h"
if [ -f "$HDR" ]; then
  perl -0pi -e 's{#import <Capacitor/Capacitor-Swift\.h>}{#import <Capacitor/Capacitor-Swift.h>\n#import <Cordova/CDVScreenOrientationDelegate.h>} unless /Cordova\/CDVScreenOrientationDelegate\.h/' "$HDR"
  echo "  ✔ hecho"
else
  echo "  (no encontrado; ¿has ejecutado npm install?)"
fi

echo "▸ 2/2  Podfile: quoted-include = NO en todos los pods (por si se regeneró)"
PODFILE="$IOS/Podfile"
if [ -f "$PODFILE" ] && ! grep -q "CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER" "$PODFILE"; then
  perl -0pi -e "s/post_install do \|installer\|\n\s*assertDeploymentTarget\(installer\)\n/post_install do |installer|\n  assertDeploymentTarget(installer)\n  installer.pods_project.targets.each do |target|\n    target.build_configurations.each do |config|\n      config.build_settings['CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER'] = 'NO'\n    end\n  end\n/" "$PODFILE"
  echo "  ✔ Podfile actualizado — recuerda: cd native/ios/App && pod install"
else
  echo "  (ya presente o Podfile no encontrado)"
fi

cat <<'NOTE'

Ajustes que además hay que poner UNA VEZ en Xcode (persisten en el .xcodeproj):
  · Proyecto App  → Build Settings → All → "User Script Sandboxing"      = No
  · Proyecto App  → Build Settings → All → "Explicitly Built Modules"    = No
  · Proyecto Pods → Build Settings → All → "Explicitly Built Modules"    = No
Luego: Product → Clean Build Folder → Archive.
NOTE
