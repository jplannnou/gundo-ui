# Matriz de fotografía del plan (Fase V)

Documento de trabajo del 16-nov-2026. Lo **medido** lleva la consulta con la que se
midió. Lo que no se pudo medir lleva `[SIN VERIFICAR]`.

## 1. Cómo funciona hoy (medido)

| Pieza | Hoy | Fuente |
|---|---|---|
| Disparo | **Lazy**: la foto se pide al abrir la comida. El front espera hasta 45 s. | ecom `58468873`: `HomeMealCard.tsx:51` → `usePlanMealImage` (`nutritional-engine-plans.ts:1880-1936`), timeout en `plan-meal-image-cache.ts:9` |
| Endpoint | `POST /nutritional-plan/user/{uid}/plans/{plan}/meals/{día}/{tipo}/image` | NE-API `be07e069`: `nutritional-plan.controller.ts:2080`, `generate-plan-meal-image.use-case.ts:62-353` |
| Servicio | `image-gen.gundo.life` (repo `photo-generator`, ECS Fargate, `us-west-2`), timeout de 30 s | `recipe-image.service.ts:97`; task definition `photo-generator` rev. 14 (`aws ecs describe-task-definition`) |
| Modelo | `stability.sd3-5-large-v1:0` para casi todos los platos; `stability.stable-image-core-v1:1` para desayunos cremosos; `stable-image-ultra-v1:1` de respaldo | `dish-routing.ts:74-78`, `bedrock-image-generator.provider.ts:124-129`. Si el *routing* está activo en producción `[SIN VERIFICAR]` (el flag no está en la task definition; podría venir en el secreto) |
| Formato | 1024 × 1024, WebP calidad 90 | `image-gen.service.ts:173`, `BEDROCK_IMAGE_SIZE=1024x1024` |
| Caché | (a) por plan en Firestore, con `imageContentKey` = sha256(nombre + ingredientes normalizados); (b) las recetas del catálogo reutilizan su foto (`catalogImageReference`, coste 0); (c) global entre usuarios en S3, con la clave sha256(prompt + system + formato) | `recipe-image-content-key.ts:26`, use-case `:131-160`, bucket `gundo-image-gen-prod-626095631548` |
| Pregeneración | Existe un paso en Mastra (`generate-recipe-images.step.ts`), **apagado** (`PLAN_IMAGE_GEN_ENABLED=false`) | `mastra-nutritional-plan-ai` `.cloudbuild-config.json:78` |

**Volumen real.** CloudWatch `AWS/Bedrock Invocations` en `us-west-2` (17-oct a 16-nov): unas 98 con SD3.5 Large (con un pico de 24 en un día), 1 con Core y 0 con Ultra. El bucket tiene unos 8.680 objetos (`AWS/S3 NumberOfObjects`, 14-nov). Casi nadie abre la foto, así que el volumen actual no sirve para proyectar.

### Coste por imagen (medido)

Cost Explorer, `USAGE_TYPE = USW2-MP:USW2_Created_image-Units`, `RECORD_TYPE = Usage`:

| Mes | Imágenes | Coste | Por imagen |
|---|---|---|---|
| oct-2026 | 91 | 7,08 $ | 0,078 $ |
| 1-15 nov 2026 | 21 | 1,68 $ | **0,080 $** |

Se cobra vía Marketplace (Stability) y **los créditos de AWS lo cubren entero**: el registro `Credit` es de −7,08 $ y −1,68 $. Los créditos son finitos, así que cada escenario de abajo se calcula a precio de lista.

La página pública de precios de Bedrock (leída el 16-nov) no publica el precio de SD3.5 Large, Core ni Ultra; solo muestra SDXL a 0,08 $ por imagen de 1024². El código trae comentarios con Core a 0,04 $, Ultra a 0,08 $ y SD3.5 a 0,08 $ (`bedrock-image-generator.provider.ts:21-34`). Lo que vale es el 0,080 $ medido arriba.

## 2. Volumen de un plan

- **Momentos del día:** 5 (`breakfast`, `midMorning`, `lunch`, `snack`, `dinner`; `meal-type.enum.ts`).
- **Días:** 3 en free, 7 por defecto en premium, con un tope de 14 (`plan-generation-tier.ts:18-19, 60`).
- **Fotos por plan, en el peor caso** (las 5 franjas siempre llenas `[SIN VERIFICAR]`): 15 en free, 35 en premium de 7 días y 70 en premium de 14 días.
- **Topes de generación** (NE-API `be07e069`, `plan-generation-rate-limit.service.ts:18-36`): 5 planes al día por usuario en free y 30 en premium. El tope global de la plataforma vale 20 por defecto en el código; en producción es 150 según el plan v4.1 `[SIN VERIFICAR hoy contra la revisión desplegada]`.

## 3. Coste de pregenerar (a 0,08 $ por imagen, sin caché)

| Escenario | Fotos | Coste |
|---|---|---|
| Un plan free (3 días) | 15 | 1,20 $ |
| Un plan premium (7 días) | 35 | 2,80 $ |
| Un plan premium (14 días) | 70 | 5,60 $ |
| Tope de código: 20 planes free al día | 300 al día | 24 $ al día, unos 720 $ al mes |
| Tope de producción: 150 planes free al día | 2.250 al día | 180 $ al día, unos 5.400 $ al mes |
| Solo el **día 1** de cada plan, con 150 planes al día | 750 al día | 60 $ al día, unos 1.800 $ al mes |

Son techos: la caché global (c) y la de catálogo (b) los rebajan en la proporción de platos repetidos. Esa tasa de acierto **no está medida** `[SIN VERIFICAR]`. Para medirla, cuenta los `imageContentKey` distintos sobre el total de comidas de los planes de los últimos 30 días.

## 4. La matriz: condición × país × momento

La foto depende del **plato**, no de la condición. La condición decide qué platos salen y, sobre todo, **qué no puede aparecer en la foto**: una foto contradice al sello si enseña lo que la regla quita. La matriz es la guía editorial para el *prompt* y la biblioteca canónica. Los textos clínicos los revisa `clinical-validator`.

### 4.1 Condición: lo que la foto no debe enseñar

| Perfil (fichas del plan v4.1) | Nunca en la foto | Debe leerse |
|---|---|---|
| Celiaquía / sin gluten | Pan, pasta o rebozados que no estén indicados como sin gluten en el nombre del plato | El plato tal cual, sin «guarniciones» de trigo |
| Embarazo | Crudos (sushi, carpaccio, huevo poco hecho, quesos de corteza blanda), pez espada, atún rojo | Cocción completa visible |
| Diabetes tipo 2 | Bebidas azucaradas, postres que no estén en el plan | El reparto del plato (verdura, proteína, hidrato) |
| Renal | Guarniciones con mucho potasio que no estén en el plan (plátano, tomate en salsa abundante) `[revisión clínica]` | Raciones moderadas |
| Hipertensión | Salero, embutidos y encurtidos de atrezo | Hierbas y limón como condimento |
| Familia | Una sola ración con aspecto de «plato individual» | Fuente al centro y varias raciones |
| Alergias (31) | El alérgeno como atrezo (frutos secos espolvoreados, sésamo) | Solo los ingredientes de la receta |
| Sin condición | — | Libre, con la dirección de marca |

Regla técnica: hoy el *prompt* usa solo los nombres de hasta 12 ingredientes. Para cumplir la matriz basta con **no añadir atrezo**: el *system prompt* debe prohibir guarniciones y elementos que no estén en la lista de ingredientes. Eso es un cambio en `photo-generator/prompts.ts`, no en el front.

### 4.2 País: vajilla, luz y platos

| País | Con súper | Dirección |
|---|---|---|
| España | Sí | Cerámica clara, mesa de madera, luz mediterránea, raciones de menú del día |
| Colombia | Sí | Platos locales (arepa, sudado, calentado), vajilla de barro o esmaltada, luz cálida |
| Resto (10 de 12 activos, según el plan v4.1 `[SIN VERIFICAR]`) | No | Neutro de marca: fondo liso, sin señas de país, para que sirva a todos |

### 4.3 Momento del día: luz y composición

| Momento | Luz | Composición |
|---|---|---|
| Desayuno | Mañana, fría y lateral | Cenital, taza en la escena si la receta la incluye |
| Media mañana | Día, suave | Formato de tentempié, en la mano o en un táper |
| Comida | Mediodía, alta | Plato completo a 45°, el más «de portada» |
| Merienda | Tarde, cálida | Pequeño y cercano |
| Cena | Ocaso, cálida y baja | Más íntima, con fondo oscuro |

### 4.4 Tamaño de la biblioteca canónica

Dos países con súper más el «neutro», por 5 momentos y unos N platos canónicos por celda. Con N = 40 salen 3 × 5 × 40 = **600 fotos, unos 48 $ una sola vez**. Que esos 40 platos por celda cubran la mayoría de los planes es una hipótesis `[SIN VERIFICAR]`: hay que medir los platos más repetidos en los planes de los últimos 30 días antes de fijar N.

## 5. Recomendación

1. **Biblioteca canónica primero** (punto 4.4): pocas decenas de dólares, cero espera para los platos frecuentes, reutilizada por la vía de catálogo (b), que ya existe y no tiene coste por uso.
2. **Pregenerar solo el día 1** al generar el plan, en segundo plano, con el paso de Mastra que ya existe (`PLAN_IMAGE_GEN_ENABLED`) limitado al primer día. Cuesta, como mucho, 0,40 $ por plan.
3. **El resto, prefetch del día siguiente**: al cerrar el día (`DayCloseCelebration`) o al abrir la app, se piden las fotos de mañana. El usuario nunca espera 30 s delante de la comida.
4. **Medir antes de ampliar**: tasa de acierto de caché, aperturas de foto por plan y coste diario en Cost Explorer (`USW2-MP:USW2_Created_image-Units`).
5. **Mientras se genera la foto**, la tarjeta pinta un *placeholder* con la ilustración del momento del día y el nombre del plato, nunca un hueco. El `alt` es el nombre del plato y sus ingredientes principales.

## 6. Accesibilidad de la foto

- `alt` = nombre del plato y sus ingredientes principales («Bol de quinoa con salmón al horno, aguacate y espinacas»). Nunca «foto de comida» ni el nombre del archivo.
- Las fotos son siempre de un plato. Nunca muestran cuerpos, básculas, cintas métricas ni nada sobre el peso (guarda TCA).
- Hay que reservar la relación de aspecto (`aspect-ratio: 1`) para que la carga de la foto no desplace la página (CLS ≤ 0,1).
