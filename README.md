# VetPremium — Frontend

Interfaz web construida con **React + TypeScript + Vite**. Panel de gestión para clínicas veterinarias: mascotas, dueños, citas, historial médico, hospitalización, inventario y facturación.

---

## Tecnologías

| Tech | Versión |
|---|---|
| React | 18 |
| TypeScript | 5 |
| Vite | 5 |
| React Router | 6 |
| Axios | 1.6 |
| Recharts | 3 |
| Lucide React | 0.344 |

---

## Requisitos previos

- [Docker](https://www.docker.com/products/docker-desktop) y Docker Compose **— opción recomendada**
- O bien: Node.js 20+ instalado localmente
- El backend debe estar corriendo (ver [veterinary-medicine-back](../veterinary-medicine-back/README.md))

---

## Instalación con Docker (recomendado)

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd veterinary-medicine-front

# 2. Levantar el contenedor
#    Por defecto apunta al backend en http://localhost:8000
docker compose up -d

# 3. Listo — App disponible en:
#    http://localhost:3000
```

Para cambiar la URL del backend:

```bash
# Edita docker-compose.yml y modifica el argumento:
#   VITE_API_URL: http://tu-backend:8000

docker compose up -d --build
```

Para bajar el contenedor:

```bash
docker compose down
```

---

## Instalación local (sin Docker)

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd veterinary-medicine-front

# 2. Instalar dependencias
npm install

# 3. Configurar la URL del backend
#    Crea un archivo .env en la raíz con:
VITE_API_URL=http://localhost:8000

# 4. Iniciar en modo desarrollo
npm run dev

# La app estará en http://localhost:5173
```

Para construir para producción:

```bash
npm run build
# Los archivos estáticos quedan en /dist
```

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del backend | `http://localhost:8000` |

> Las variables de Vite deben comenzar con `VITE_` para estar disponibles en el navegador.

---

## Estructura del proyecto

```
veterinary-medicine-front/
├── index.html
├── vite.config.js
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .env                        # Variables de entorno (no subir a git)
├── public/
│   └── login-bg.png            # Imagen de fondo del login
└── src/
    ├── main.tsx                # Entrada de la aplicación
    ├── App.tsx                 # Rutas principales
    ├── index.css               # Estilos globales
    ├── types.ts                # Tipos TypeScript globales
    ├── context/
    │   └── AuthContext.tsx     # Estado global de autenticación
    ├── services/
    │   └── api.ts              # Cliente Axios + servicios por módulo
    └── components/             # Componentes por módulo
        ├── Login.tsx
        ├── Dashboard.tsx
        ├── Pets.tsx
        ├── Owners.tsx
        ├── Appointments.tsx
        ├── MedicalRecords.tsx
        ├── Hospitalization.tsx
        ├── Inventory.tsx
        ├── Billing.tsx
        └── ...
```

---

## Módulos disponibles

| Módulo | Descripción |
|---|---|
| Login | Autenticación con JWT |
| Dashboard | Estadísticas y resumen general |
| Mascotas | CRUD, foto, peso, historial |
| Dueños | Gestión de propietarios |
| Citas | Agenda de consultas |
| Historial médico | Registros clínicos y adjuntos |
| Prescripciones | Recetas médicas |
| Vacunas | Recordatorios de vacunación |
| Hospitalización | Jaulas, internamiento, signos vitales |
| Inventario | Productos y stock |
| Facturación | Facturas e historial de pagos |
| Roles | Gestión de usuarios y permisos |

---

## Autenticación

El login genera un **JWT** que se almacena en `localStorage` y se adjunta automáticamente a todas las peticiones via interceptor de Axios. Al expirar o recibir un 401, la sesión se cierra automáticamente.
