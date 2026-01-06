# 📁 Carpeta de Logos de Productos

## 📌 Instrucciones

### 1️⃣ Coloca aquí las imágenes de tus productos
- **Formato recomendado**: PNG (con transparencia) o JPG
- **Nombres**: `1.png`, `2.png`, `3.png`, etc.
- **Tamaño recomendado**: 500x500px o proporcional

### 2️⃣ Estructura de archivos
```
public/logos/
├── 1.png    ← Logo producto 1
├── 2.png    ← Logo producto 2
├── 3.png    ← Logo producto 3
└── ...
```

### 3️⃣ Acceso desde el navegador
Las imágenes estarán disponibles en:
```
http://localhost:3000/logos/1.png
http://localhost:3000/logos/2.png
http://localhost:3000/logos/3.png
```

### 4️⃣ Cómo usar en la base de datos
En tu tabla de productos, guarda solo el nombre del archivo:

**❌ Incorrecto:**
```json
{
  "imagen": "C:\\Users\\Acer\\public\\logos\\1.png"
}
```

**✅ Correcto:**
```json
{
  "imagen": "1.png"
}
```

### 5️⃣ Cómo usar en React/Angular (Frontend)
En tu componente, construye la URL completa:

**React:**
```jsx
const API_URL = 'http://localhost:3000';

function ProductoCard({ producto }) {
  return (
    <img 
      src={`${API_URL}/logos/${producto.imagen}`} 
      alt={producto.nombre}
    />
  );
}
```

**Angular:**
```typescript
export class ProductoComponent {
  API_URL = 'http://localhost:3000';
  
  getImagenUrl(imagen: string): string {
    return `${this.API_URL}/logos/${imagen}`;
  }
}
```

```html
<img [src]="getImagenUrl(producto.imagen)" [alt]="producto.nombre">
```

### 6️⃣ Buenas prácticas
- ✅ Usa nombres consistentes (1.png, 2.png, 3.png...)
- ✅ Optimiza las imágenes antes de subirlas (usa TinyPNG o similar)
- ✅ Mantén tamaños proporcionales (cuadrado 500x500 o 16:9)
- ❌ No uses espacios en los nombres (`producto 1.png` ❌ → `1.png` ✅)
- ❌ No uses caracteres especiales (`producto_ñandú.png` ❌)

### 7️⃣ Ejemplo completo

**1. Coloca tu imagen aquí:**
```
public/logos/whisky-red-label.png
```

**2. En la base de datos:**
```sql
INSERT INTO productos (nombre, imagen) 
VALUES ('Whisky Red Label', 'whisky-red-label.png');
```

**3. En el frontend:**
```jsx
<img src="http://localhost:3000/logos/whisky-red-label.png" alt="Whisky Red Label" />
```

---

## 🔥 La carpeta ya está lista!
Solo falta que copies tus imágenes aquí. 🚀
