Actúa como un equipo senior de producto + arquitectura + desarrollo full-stack mobile/web especializado en SaaS operativos para negocios físicos con alta rotación de clientes. Tu objetivo es diseñar e implementar un producto real, no una demo visual.

CONTEXTO DEL NEGOCIO
Estamos creando un sistema digital para una barbería real llamada Wolf Barbershop. Actualmente trabajan 3 barberos y tienen mucha demanda. Su operativa actual es manual: gestionan citas por Instagram, llamadas y libreta física. Esto genera retrasos, mala previsión, descontrol de llegadas, dificultad para estimar tiempos reales, carga administrativa innecesaria y poca visibilidad operativa y económica del día.

PROBLEMAS REALES A RESOLVER
1. Retrasos acumulados porque las citas no reflejan la realidad de la jornada.
2. Los clientes no saben si van a ser atendidos a su hora real.
3. Los barberos pierden tiempo respondiendo mensajes y llamadas para agendar.
4. No existe una cola en tiempo real ni un control simple del flujo dentro del local.
5. Al final del día no tienen una vista clara de cuánto se ha cobrado, cómo se ha cobrado y quién ha cobrado qué.
6. Los usuarios internos del sistema tienen muy pocos conocimientos tecnológicos y son reticentes a usar software complejo.
7. No queremos perder la sensación de cercanía, trato personal y hospitalidad que se transmite al hablar con el barbero.

OBJETIVO DEL PRODUCTO
Crear una solución que supere la propuesta de valor de herramientas como Booksy no por copiar sus funciones básicas, sino por resolver mejor la operativa real de una barbería de alta demanda. El producto debe reducir trabajo manual, mejorar la puntualidad percibida, aumentar ocupación, reducir fricción en reservas y dar control operativo y económico al negocio.

PRINCIPIOS DE DISEÑO DEL PRODUCTO
1. Mobile-first.
2. UX extremadamente simple.
3. Los barberos no deben tocar más de 2 o 3 veces por cliente.
4. La mayor cantidad posible de estados debe inferirse automáticamente.
5. El cliente debe poder hacer auto check-in al llegar.
6. El sistema debe funcionar bien para usuarios con baja alfabetización digital.
7. El tono visual y funcional debe ser premium, moderno y cálido, no corporativo frío.
8. No crear una app recargada ni genérica de salón; debe sentirse diseñada para una barbería.
9. Evitar fricción: pocos campos, pocos pasos, botones grandes, lenguaje claro.
10. Diseñar primero para el flujo operativo real del local y después para extras de marketing.

DEFINICIÓN DEL ALCANCE
Queremos una base única de código para:
- web
- móvil Android
- móvil iOS

STACK PREFERIDO
- Expo
- React Native
- TypeScript
- Expo Router
- Supabase
- PostgreSQL
- Realtime
- Auth
- Row Level Security
- Tailwind Native o sistema de estilos consistente y mantenible
- React Query
- Zustand o solución simple de estado global
- Arquitectura modular, limpia y escalable

SI PROPONES CAMBIOS AL STACK
Solo hazlo si justificas claramente que mejora tiempo de entrega, mantenibilidad o experiencia de usuario. No cambies el stack por preferencia personal.

TIPOS DE USUARIO
1. Cliente final
2. Barbero
3. Dueño / administrador

MVP OBLIGATORIO
1. Gestión de barberos
2. Gestión de servicios
3. Gestión de horarios y disponibilidad
4. Reservas
5. Reprogramación y cancelación
6. Auto check-in del cliente por QR o enlace
7. Cola en tiempo real
8. Estados operativos simples
9. Botones grandes para:
   - empezar
   - terminar
   - cobrar
10. Registro de pagos por:
   - efectivo
   - tarjeta
   - Bizum
   - mixto
11. Cierre diario
12. Historial básico de clientes
13. Notificaciones recordatorio
14. ETA estimada / retraso estimado
15. Dashboard básico del negocio

ESTADOS DEL FLUJO
Diseña un motor de estados claro y auditable. Estados mínimos:
- booked
- confirmed
- checked_in
- waiting
- in_chair
- in_service
- finished_pending_payment
- paid
- cancelled
- no_show

IMPORTANTE
No queremos que el barbero actualice todos esos estados manualmente. Diseña el sistema para que solo tenga que realizar pocas acciones. El resto debe inferirse por eventos y reglas.

EVENTOS CLAVE
- reserva creada
- cliente confirmado
- cliente hace check-in
- barbero inicia servicio
- barbero termina servicio
- pago registrado
- cancelación
- no-show detectado

REGLAS DE NEGOCIO
1. Si el cliente hace check-in y el barbero sigue ocupado, el cliente entra automáticamente en waiting.
2. Si el barbero pulsa empezar, el cliente pasa a in_service.
3. Si el barbero pulsa terminar, pasa a finished_pending_payment.
4. Si se registra un pago, pasa a paid.
5. El sistema debe recalcular ETAs continuamente en base a duración estimada, duración real por servicio, duración histórica por barbero y retraso acumulado.
6. Debe existir tolerancia configurable para no-show.
7. Debe existir margen configurable entre servicios.
8. Debe existir soporte para servicios con distinta duración.
9. Debe existir opción de asignar al cliente a un barbero concreto o al primero disponible.
10. El sistema debe soportar tanto reserva tradicional como cola híbrida con clientes que llegan sin cita en futuras iteraciones.

MODELO DE DATOS ESPERADO
Proponer entidades y relaciones para, como mínimo:
- barbers
- clients
- services
- appointments
- appointment_events
- payments
- payment_splits
- schedules
- daily_closings
- notes
- notifications
- metrics_snapshots

Cada entidad debe justificarse. Añade índices, restricciones y reglas de integridad relevantes.

EXPERIENCIA DE CLIENTE
Queremos una experiencia extremadamente cómoda:
- reservar en pocos pasos
- elegir barbero o primero disponible
- ver duración y precio
- reprogramar fácil
- cancelar fácil
- check-in fácil
- conocer retraso estimado
- repetir último corte fácilmente
- mantener sensación de trato personal

EXPERIENCIA INTERNA DE BARBERÍA
Queremos una pantalla principal tipo “modo barbería” con:
- ahora
- siguiente
- esperando
- retraso acumulado
- botones grandes
- visibilidad inmediata del estado del día
- cero complejidad innecesaria

FUNCIONALIDADES DIFERENCIALES A DISEÑAR DESPUÉS DEL MVP
Incluye diseño técnico para iteraciones futuras:
- waitlist inteligente
- relleno automático de huecos de última hora
- re-reserva automática sugerida
- clientes frecuentes
- membresías
- bonos
- paquetes
- campañas de horas valle
- anti-no-show con depósito
- notas personales del cliente
- historial de preferencias
- panel avanzado para dueño
- métricas por barbero
- ingresos por método de pago
- tiempos reales vs estimados
- ocupación por silla
- ticket medio
- clientes dormidos y reactivación

NO OBJETIVOS INICIALES
No construir todavía:
- marketplace público estilo directorio
- e-commerce complejo
- contabilidad empresarial completa
- automatizaciones gigantes de marketing
- IA decorativa sin utilidad operativa
- sistema sobredimensionado

REQUISITOS DE UX
1. Botones grandes y claros
2. Tipografía legible
3. Navegación mínima
4. Acciones críticas accesibles en 1 toque
5. Muy poco texto por pantalla
6. Formularios cortos
7. Estado visible siempre
8. Diseño premium pero usable
9. Compatible con móvil y tablet
10. Preparado para uso rápido en un local con ritmo alto

REQUISITOS TÉCNICOS
1. Código limpio y modular
2. TypeScript estricto
3. Manejo correcto de errores
4. Validación de inputs
5. Seguridad por roles
6. Políticas RLS coherentes
7. Auditoría de eventos operativos
8. Preparado para escalado a varias barberías en el futuro aunque el MVP sea para una
9. Variables de entorno claras
10. Seeds de desarrollo
11. Documentación técnica útil
12. Estructura de repo mantenible
13. Testing razonable en flujos críticos

ARQUITECTURA MULTI-TENANT
Diseña el sistema de forma que una barbería sea un tenant. Aunque empecemos con una sola, no queremos rehacer la arquitectura si el producto evoluciona a SaaS para varias barberías.

ENTREGABLES QUE QUIERO DE TI ANTES DE IMPLEMENTAR
1. Resumen ejecutivo del producto
2. Arquitectura propuesta
3. Justificación del stack
4. Modelo de datos inicial
5. Flujos críticos del sistema
6. Lista de pantallas
7. Roadmap de implementación por fases
8. Riesgos técnicos y de producto
9. Backlog priorizado MVP vs post-MVP
10. Supuestos que estás haciendo

FORMA DE TRABAJAR
- No generes código enorme sin plan previo.
- No sobreingenierices.
- No metas librerías innecesarias.
- No conviertas esto en un clon genérico de Booksy.
- Prioriza flujo operativo real, sencillez y tiempo de entrega.
- Si ves ambigüedades, resuélvelas con criterios pragmáticos y explícitalas.
- Propón primero la solución completa y luego implementa por módulos.
- Cuando implementes, hazlo en slices verticales funcionales.
- Cada fase debe dejar algo ejecutable.
- Mantén el lenguaje de documentación en español claro y profesional.

CRITERIOS DE ÉXITO DEL MVP
1. Un cliente puede reservar sin ayuda.
2. Un cliente puede hacer check-in al llegar.
3. Un barbero puede gestionar el día con muy pocos toques.
4. El sistema muestra una visión útil del retraso y la cola.
5. Se puede registrar cada cobro correctamente por método de pago.
6. El dueño puede cerrar el día sin contar mentalmente ni revisar chats.
7. El producto reduce llamadas, mensajes y caos operativo.

TAREA INICIAL
Con todo lo anterior:
1. define la arquitectura
2. propone el modelo de datos
3. diseña las pantallas principales
4. crea el roadmap
5. genera el backlog del MVP
6. identifica decisiones críticas
7. solo después de eso, empieza la implementación del esqueleto base del proyecto