# 📁 Carpeta de Imágenes de Productos

## 📌 Instrucciones

### 1️⃣ Coloca aquí las imágenes principales de tus productos
- **Formato recomendado**: JPG o PNG
- **Nombres**: `1.jpg`, `2.jpg`, `3.jpg`, etc. o nombres descriptivos
- **Tamaño recomendado**: 800x800px o superior para calidad HD

### 2️⃣ Estructura de archivos
```
public/productos/
├── 1.jpg              ← Imagen producto 1
├── 2.jpg              ← Imagen producto 2
├── 3.jpg              ← Imagen producto 3
├── whisky-etiqueta-roja.jpg  ← Nombres descriptivos también funcionan
└── ...
```

### 3️⃣ Acceso desde el navegador
Las imágenes estarán disponibles en:
```
http://localhost:3000/productos/1.jpg
http://localhost:3000/productos/2.jpg
http://localhost:3000/productos/whisky-etiqueta-roja.jpg
```

### 4️⃣ Cómo usar en la base de datos
En tu tabla de productos, guarda solo el nombre del archivo:

**❌ Incorrecto:**
```json
{
  "imagen_principal": "C:\\Users\\Acer\\public\\productos\\1.jpg"
}
```

**✅ Correcto:**
```json
{
  "imagen_principal": "1.jpg"
}
```

### 5️⃣ Cómo usar en React/Angular (Frontend)
En tu componente, construye la URL completa:

**React:**
```jsx
const API_URL = 'http://localhost:3000';

function ProductoDetalle({ producto }) {
  return (
    <img 
      src={`${API_URL}/productos/${producto.imagen_principal}`} 
      alt={producto.nombre}
      className="producto-imagen"
    />
  );
}
```

**Angular:**
```typescript
export class ProductoDetalleComponent {
  API_URL = 'http://localhost:3000';
  
  getImagenUrl(imagen: string): string {
    return `${this.API_URL}/productos/${imagen}`;
  }
}
```

```html
<img [src]="getImagenUrl(producto.imagen_principal)" [alt]="producto.nombre">
```

### 6️⃣ Diferencia entre /logos y /productos

| Carpeta | Uso | Tamaño | Formato |
|---------|-----|--------|---------|
| `/logos` | Logos pequeños, íconos, thumbnails | 500x500px | PNG (transparencia) |
| `/productos` | Imágenes principales, detalle del producto | 800x800px o más | JPG (mejor calidad) |

**Ejemplo:**
```javascript
{
  "nombre": "Whisky Red Label",
  "logo": "1.png",                    // ← pequeño, para listados
  "imagen_principal": "1.jpg"         // ← grande, para detalle
}
```

### 7️⃣ Buenas prácticas
- ✅ Usa nombres consistentes (`1.jpg`, `2.jpg`, `3.jpg`...)
- ✅ Optimiza las imágenes antes de subirlas (usa TinyJPG o similar)
- ✅ Usa JPG para fotos de productos (mejor compresión)
- ✅ Usa PNG solo si necesitas transparencia
- ✅ Mantén proporciones cuadradas o 16:9
- ❌ No uses espacios en los nombres (`producto 1.jpg` ❌ → `1.jpg` ✅)
- ❌ No uses tildes ni ñ (`caña.jpg` ❌ → `cana.jpg` ✅)

### 8️⃣ Ejemplo completo

**1. Coloca tu imagen aquí:**
```
public/productos/whisky-red-label.jpg
```

**2. En la base de datos:**
```sql
INSERT INTO productos (nombre, imagen_principal, logo) 
VALUES ('Whisky Red Label', 'whisky-red-label.jpg', 'whisky-red-label.png');
```

**3. En el frontend:**
```jsx
// Imagen grande para página de detalle
<img src="http://localhost:3000/productos/whisky-red-label.jpg" />

// Logo pequeño para listado
<img src="http://localhost:3000/logos/whisky-red-label.png" />
```

---

## 🎯 Casos de uso recomendados

### Página de catálogo (listado):
```jsx
// Usa /logos (más rápidas de cargar)
<img src={`${API_URL}/logos/${producto.logo}`} />
```

### Página de detalle del producto:
```jsx
// Usa /productos (mejor calidad)
<img src={`${API_URL}/productos/${producto.imagen_principal}`} />
```

### Carrito de compras:
```jsx
// Usa /logos (thumbnails pequeños)
<img src={`${API_URL}/logos/${item.logo}`} />
```

---

## 🔥 La carpeta ya está lista!
Solo falta que copies tus imágenes de productos aquí. 🚀

**Tip:** Si tienes muchas imágenes, puedes organizarlas por categoría:
```
public/productos/
├── whisky/
│   ├── red-label.jpg
│   └── black-label.jpg
├── cerveza/
│   ├── corona.jpg
│   └── heineken.jpg
└── ...
```

Y accederlas como:
```
http://localhost:3000/productos/whisky/red-label.jpg
```
