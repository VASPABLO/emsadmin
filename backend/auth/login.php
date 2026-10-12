<?php
require __DIR__ . '/../config/bootstrap.php';

$rolesValidos = ['usuario', 'vendedor', 'cajera', 'admin'];

$mensajeLogin = "";

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $emailLogin = $_POST['email'];
        $contrasenaLogin = $_POST['contrasena'];

        // Verificar las credenciales del usuario
        $sqlCheckCredenciales = "SELECT idUsuario, nombre, email, contrasena, rol FROM `usuarios` WHERE email = :email";
        $stmtCheckCredenciales = $conexion->prepare($sqlCheckCredenciales);
        $stmtCheckCredenciales->bindParam(':email', $emailLogin);
        $stmtCheckCredenciales->execute();

        if ($stmtCheckCredenciales->rowCount() > 0) {
            $row = $stmtCheckCredenciales->fetch(PDO::FETCH_ASSOC);
            $contrasenaHash = $row['contrasena'];

            if (password_verify($contrasenaLogin, $contrasenaHash)) {
                // Iniciar sesión solo si el rol es uno de los roles válidos del sistema
                if (in_array($row['rol'], $rolesValidos, true)) {
                    $_SESSION['usuario_id'] = $row['idUsuario'];
                    $_SESSION['rol'] = $row['rol'];

                    // Añadir nombre, email y rol al array del usuario
                    $usuario = [
                        "idUsuario" => $row['idUsuario'],
                        "nombre" => $row['nombre'],
                        "email" => $row['email'],
                        "rol" => $row['rol'],
                    ];

                    echo json_encode(["mensaje" => "Inicio de sesión exitoso", "usuario" => $usuario]);
                } else {
                    echo json_encode(["error" => "No tienes permisos para acceder"]);
                }
                exit();
            } else {
                echo json_encode(["error" => "Contraseña incorrecta"]);
            }
        } else {
            echo json_encode(["error" => "Usuario no encontrado"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
