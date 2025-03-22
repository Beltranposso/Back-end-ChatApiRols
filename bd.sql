CREATE TABLE sitios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255) NOT NULL UNIQUE,  -- URL del dominio de WordPress
    nombre VARCHAR(255) NOT NULL,      -- Nombre del sitio
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios (coordinadores y asesores)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sitio_id INT,                 -- Relación con el sitio de WordPress
    nombre VARCHAR(255) NOT NULL, -- Nombre del usuario
    email VARCHAR(255) NOT NULL UNIQUE, -- Correo para autenticación
    password VARCHAR(255) NOT NULL,  -- Contraseña encriptada
    rol ENUM('coordinador', 'asesor') NOT NULL, -- Rol del usuario
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sitio_id) REFERENCES sitios(id) ON DELETE CASCADE
);

-- Tabla de clientes anónimos (Usuarios que envían mensajes desde cada sitio)
CREATE TABLE clientes_anonimos (
    id VARCHAR(50) PRIMARY KEY,   -- ID único del cliente (ej: socket ID)
    sitio_id INT,                 -- Relación con el sitio de WordPress
    nombre VARCHAR(255) NOT NULL, -- Nombre del cliente anónimo
    ip VARCHAR(45) NOT NULL,      -- Dirección IP del cliente
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sitio_id) REFERENCES sitios(id) ON DELETE CASCADE
);

-- Tabla de chats (Cada conversación entre un cliente y un asesor)
CREATE TABLE chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sitio_id INT,                 -- Relación con el sitio de WordPress
    cliente_id VARCHAR(50),        -- Relación con el cliente anónimo
    asesor_id INT NULL,            -- Relación con el asesor asignado (puede ser NULL al inicio)
    estado ENUM('abierto', 'cerrado') DEFAULT 'abierto',  -- Estado del chat
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sitio_id) REFERENCES sitios(id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES clientes_anonimos(id) ON DELETE CASCADE,
    FOREIGN KEY (asesor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabla de mensajes (Historial de mensajes enviados)
CREATE TABLE mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT,                   -- Relación con el chat al que pertenece el mensaje
    contenido TEXT NOT NULL,        -- Contenido del mensaje
    enviado_por ENUM('cliente', 'asesor') NOT NULL,  -- Quién envió el mensaje
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);