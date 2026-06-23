# TropelCare Control Room

Hackathon frontend - Consola operativa para gestión de Tropeles.

## Integrantes

- Ximena Gamero Goyzueta - 202510310
- Luana Yolanda Meniz Cueva - 202510593
- Alondra Solange Obregon Carhuavilca - 202510394

## Instalación

```bash
npm install
```

## Variables de entorno

Crear archivo `.env` basado en `.env.example`:

```env
VITE_API_BASE_URL=https://hackaton-20261-front-587720740455.us-east1.run.app/api/v1
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npm run typecheck` | Verificar tipos TypeScript |
| `npm run preview` | Vista previa del build |

## Decisiones técnicas

- React 19 + TypeScript + Vite + Tailwind CSS v4
- Axios para llamadas API con interceptor JWT
- React Router v7 con search params para estado en URL
- Infinite scroll mediante Intersection Observer
- Scrollytelling con Intersection Observer y métricas por etapa
- `@view-transition` y `prefers-reduced-motion` soportados
