const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken'); // <--- AÑADE ESTA LÍNEA
const app = express();
app.use(express.json());

// Configuración de Supabase
const supabaseUrl = 'https://bqnekvkahkyvsanarfdb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- RUTA: LISTAR BICICLETAS (GET) ---
app.get('/api/bicicletas', async (req, res) => {
    try {
        const { data, error } = await supabase.from('bicicletas').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTA: REGISTRAR BICICLETA (POST) ---
app.post('/api/bicicletas', async (req, res) => {
    try {
        const { id_propietario, serial_cuadro, marca, modelo, tipo, color_principal, estatus, token_qr } = req.body;
        const { data, error } = await supabase
            .from('bicicletas')
            .insert([{ id_propietario, serial_cuadro, marca, modelo, tipo, color_principal, estatus, token_qr }])
            .select();
        
        if (error) throw error;
        res.json({ mensaje: "Bicicleta registrada con éxito", data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTA: REGISTRAR USUARIO (POST) ---
app.post('/api/usuarios', async (req, res) => {
    try {
        const { cedula, nombre_completo, telefono, parroquia, password_hash, rol } = req.body;
        const { data, error } = await supabase.from('usuarios').insert([{ 
            cedula, nombre_completo, telefono, parroquia, password_hash, rol 
        }]).select();
        if (error) throw error;
        res.json({ mensaje: "Usuario registrado con éxito", data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/usuarios', async (req, res) => {
    try {
        const { data, error } = await supabase.from('usuarios').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// --- RUTA: REALIZAR TRASPASO (POST) ---
app.post('/api/traspasos', async (req, res) => {
    try {
        const { id_bici, id_vendedor, id_comprador } = req.body;
        const { error: errorTraspaso } = await supabase.from('traspasos').insert([{ 
            id_bici, id_vendedor, id_comprador, estatus_traspaso: 'Completado' 
        }]);
        if (errorTraspaso) throw errorTraspaso;

        const { error: errorUpdate } = await supabase
            .from('bicicletas')
            .update({ id_propietario: id_comprador })
            .eq('id_bici', id_bici);
        if (errorUpdate) throw errorUpdate;

        res.json({ mensaje: "Traspaso de La Patrona completado con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// --- RUTA: HISTORIAL DE UNA BICICLETA ---
app.get('/api/traspasos/:id_bici', async (req, res) => {
    try {
        const { id_bici } = req.params;
        const { data, error } = await supabase
            .from('traspasos')
            .select(`
                id_traspaso,
                fecha_traspaso,
                vendedor:usuarios!traspasos_id_vendedor_fkey(nombre_completo),
                comprador:usuarios!traspasos_id_comprador_fkey(nombre_completo)
            `)
            .eq('id_bici', id_bici);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});
