# Plataformas y Custodia — ¿Dónde vive el dinero y quién lo tiene?

Regla de partida: **el activo y la plataforma son dos riesgos distintos.** Bitcoin puede subir y la app donde
está guardado puede quebrar, congelar retiradas o ser hackeada. Se analizan por separado, siempre.

Historial que conviene tener presente: Mt. Gox, QuadrigaCX, Celsius, BlockFi, Voyager y FTX eran plataformas
con app pulida, interfaz profesional y usuarios contentos — hasta el día en que dejaron de devolver el dinero.
Ninguna parecía sospechosa desde dentro de la aplicación. **La calidad del diseño no dice nada sobre la solvencia.**

---

## 1. Los tres modelos de custodia

| Modelo | Quién tiene las claves | Riesgo principal | Ejemplo de módulo |
|---|---|---|---|
| **Custodio (CeFi)** | La plataforma | Que la plataforma quiebre, congele o sea hackeada | Saldo en el exchange, Earn, Borrow |
| **Auto-custodia** | El usuario (frase semilla) | Perder la frase, o firmar una transacción maliciosa | Wallet propia, DEX |
| **Bróker regulado** | Entidad regulada, con separación de activos | Bajo para el activo; alto si se opera con derivados | Acciones y ETFs |

**La frase que resume el modelo custodio:** si no tienes las claves privadas, no tienes las monedas — tienes
un apunte contable que dice que la plataforma te debe unas monedas. En una quiebra, eso te convierte en acreedor,
no en propietario.

Esto no significa que la auto-custodia sea automáticamente mejor: cambia el riesgo de "que quiebren" a "que
pierdas la frase semilla o firmes algo que no entiendes". Ambos riesgos son reales; hay que elegir cuál se
gestiona mejor.

---

## 2. Mapa de módulos de una app de inversión cripto

Las apps modernas mezclan en la misma pantalla productos con riesgos radicalmente distintos.
Identificar el módulo es el primer paso de cualquier lectura de pantalla.

| Módulo | Nombre habitual | Qué es realmente | Riesgo dominante |
|---|---|---|---|
| **Spot / Trading** | Trading, Intercambiar, Exchange | Compra directa del activo | Precio + custodia de la plataforma |
| **Perps / Futuros** | Perps, Perpetuos, Futuros | Derivado apalancado, sin vencimiento | **Liquidación total.** El más peligroso con diferencia |
| **Earn** | Gana, Earn, Staking, Rendimiento | Prestar tus monedas a cambio de interés | Riesgo de contraparte: si quien las usa no las devuelve, no vuelven |
| **Borrow** | Pedir prestado, Préstamos | Pedir dinero dejando cripto como aval | Liquidación forzosa del aval si el precio cae |
| **DEX / Swap** | DEX, Wallet, Intercambio descentralizado | Intercambio sin intermediario desde tu propia wallet | Slippage, comisión de red, tokens falsos, firmas maliciosas |
| **Descubrir** | Descubrir, Explorar, Tendencias | Escaparate de activos que suben hoy | Sesgo de recencia: lo que más ha subido no es lo que más va a subir |

**Sobre los módulos "Gana" / Earn:** un rendimiento no aparece de la nada. Alguien está pagando ese interés
por algún motivo. Antes de usarlo, la pregunta obligatoria es **"¿de dónde sale exactamente este rendimiento
y quién lo paga?"**. Si no hay una respuesta clara y verificable en la documentación, no se usa. Rendimientos
muy por encima del mercado casi siempre significan riesgo oculto de contraparte, no habilidad.

**Sobre las listas "Principales motores" / "Ganadores":** son las que más han subido en las últimas 24 horas.
Es el escaparate diseñado para provocar operaciones, no una lista de oportunidades. Un activo que sube un 10%
hoy es, por definición, un activo un 10% más caro que ayer.

---

## 3. Checklist de verificación de plataforma

Se responde **antes** de meter dinero, y se vuelve a responder cada cierto tiempo.

### Regulación y entidad
- [ ] ¿Qué empresa opera el servicio, con qué nombre legal y en qué país está constituida?
- [ ] En España: ¿está registrada en el **Banco de España** (registro de proveedores de servicios de
      criptoactivos) o autorizada bajo **MiCA**? Comprobarlo en el registro oficial, **no en la web de la propia app**.
- [ ] Para acciones: ¿el bróker está registrado en la **CNMV** o en el regulador de su país europeo?
      ¿Hay fondo de garantía de inversiones y por qué importe?
- [ ] ¿Aparece en la lista de **entidades advertidas ("chiringuitos financieros")** de la CNMV?
- [ ] Ojo con la diferencia entre "registrada para prevención de blanqueo" y "supervisada prudencialmente":
      lo primero **no** garantiza que tu dinero esté protegido si la entidad quiebra.

### Custodia y solvencia
- [ ] ¿Los fondos de clientes están segregados de los fondos de la empresa?
- [ ] ¿Publica prueba de reservas auditada, con pasivos incluidos? (una prueba de reservas sin pasivos no
      demuestra nada: enseña lo que tiene, no lo que debe)
- [ ] ¿Quién es el custodio real de los activos? ¿Hay seguro y qué cubre exactamente?
- [ ] ¿Ha habido incidentes, hackeos o suspensiones de retirada en su historia?

### Prueba práctica (la más informativa de todas)
- [ ] Depositar una cantidad pequeña, y **retirarla completa** antes de meter más.
- [ ] Cronometrar cuánto tarda la retirada y qué comisiones reales se aplican.
- [ ] Comprobar que los precios que muestra la app **coinciden con una fuente externa independiente**.
- [ ] Comprobar el coste total de ida y vuelta: comprar y vender inmediatamente y ver cuánto se ha perdido.
      Ese número es la comisión real, y suele ser bastante mayor que la anunciada.

### Señales de alarma
- Rendimientos garantizados, o "sin riesgo", o muy por encima del mercado.
- Presión para depositar más, bonus por invitar amigos, o gestor personal que llama por teléfono.
- Retiradas que se retrasan, se piden documentos nuevos al retirar, o hay que pagar un "impuesto" para poder retirar.
- No se puede identificar quién está detrás de la empresa.
- Contacto que llegó por redes sociales, Telegram, WhatsApp o una relación online reciente.
  **Este patrón es el fraude más extendido en cripto**: la plataforma es una web falsa que muestra beneficios
  inventados y solo deja de funcionar cuando se intenta sacar el dinero.

---

## 4. Datos que no cuadran

Antes de analizar nada a partir de una pantalla, comprobar que los datos son reales:

- Contrastar el precio mostrado con **al menos una fuente externa** (un exchange grande, un agregador conocido).
- Comprobar que la divisa es la esperada (€ vs $ cambia todos los números).
- Comprobar si hay entorno de prueba, modo demo, datos de ejemplo o simulador activado — muchas apps lo tienen
  y no siempre está señalado con claridad.
- Comprobar la fecha del dato: precios cacheados o desfasados producen análisis inútiles.

**Si los precios de la pantalla no coinciden con el mercado real, hay que decirlo antes que cualquier otra cosa
y detener el análisis ahí.** Un dato erróneo no se compensa con un buen razonamiento.

---

## 5. Seguridad operativa (si hay auto-custodia)

- La **frase semilla** de 12/24 palabras es la propiedad. Quien la tiene, tiene el dinero.
- Nunca se escribe en el móvil, en el ordenador, en el correo, en fotos ni en la nube. Papel o metal, offline.
- **Nadie legítimo la pide nunca.** Ni soporte técnico, ni una web, ni un formulario, ni una "verificación
  de wallet". Cualquiera que la pida está robando, sin excepción.
- Verificación en dos pasos con app de autenticación, no por SMS (el SMS es vulnerable a duplicado de SIM).
- Antes de firmar en un DEX, leer qué se está firmando: una aprobación ilimitada de gasto puede vaciar la wallet
  después, sin necesidad de volver a pedir permiso.
- Contraseñas únicas y gestor de contraseñas. El correo de recuperación es el eslabón más atacado.
- Tokens con el nombre de un proyecto conocido pero contrato distinto: verificar siempre el contrato en la
  fuente oficial del proyecto antes de intercambiar.
