const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Configuración de Supabase
const supabaseUrl = 'https://bqnekvkahkyvsanarfdb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- RUTA DE USUARIOS ---
app.post('/api/usuarios', async (req, res) => {
    try {
        const { cedula, nombre_completo, telefono, parroquia, password_hash, rol } = req.body;
        const { data, error } = await supabase.from('Usuarios').insert([{ 
            cedula, nombre_completo, telefono, parroquia, password_hash, rol 
        }]);
        if (error) throw error;
        res.json({ mensaje: "Usuario registrado con éxito en La Patrona", data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTA DE BICICLETAS ---
app.post('/api/bicicletas', async (req, res) => {
    try {
        const { id_propietario, serial_cuadro, Marca, Modelo, tipo, color_principal, Estatus, Token_qr } = req.body;
        const { data, error } = await supabase.from('Bicicletas').insert([{ 
            id_propietario, serial_cuadro, Marca, Modelo, tipo, color_principal, Estatus, Token_qr 
        }]);
        if (error) throw error;
        res.json({ mensaje: "Bicicleta registrada con éxito", data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTA DE TRASPASOS (Actualiza dueño y registra movimiento) ---
app.post('/api/traspasos', async (req, res) => {
    try {
        const { id_bici, id_vendedor, id_comprador } = req.body;

        // 1. Registrar el movimiento en la tabla Traspasos
        const { error: errorTraspaso } = await supabase.from('Traspasos').insert([{ 
            id_bici, id_vendedor, id_comprador, estatus_traspaso: 'Completado' 
        }]);
        if (errorTraspaso) throw errorTraspaso;

        // 2. Actualizar el dueño en la tabla Bicicletas
        const { error: errorUpdate } = await supabase
            .from('Bicicletas')
            .update({ id_propietario: id_comprador })
            .eq('id_bici', id_bici);
        if (errorUpdate) throw errorUpdate;

        res.json({ mensaje: "Traspaso de La Patrona completado con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});
