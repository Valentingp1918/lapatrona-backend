const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Configuramos para que busque la clave en las variables de entorno de Render
const supabaseUrl = 'https://bqnekvkahkyvsanarfdb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/', (req, res) => {
    res.json({ mensaje: "Servidor de La Patrona activo y corriendo correctamente 🚀" });
});

// ... (tu resto del código del post sigue igual) ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo y escuchando en el puerto ${PORT}`);
});
