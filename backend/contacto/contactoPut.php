<?php
require __DIR__ . '/../config/bootstrap.php';

requireRole(['admin']);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $idContacto = isset($_GET['idContacto']) ? $_GET['idContacto'] : null;
        $data = json_decode(file_get_contents("php://input"), true);
        $nuevoNombre = isset($data['nombre']) ? $data['nombre'] : null;
        $nuevoTelefono = isset($data['telefono']) ? $data['telefono'] : null;
        $nuevoInstagram = isset($data['instagram']) ? $data['instagram'] : null;
        $nuevoEmail = isset($data['email']) ? $data['email'] : null;
        $nuevaDireccion = isset($data['direccion']) ? $data['direccion'] : null;
        $nuevofacebook = isset($data['facebook']) ? $data['facebook'] : null; 

        $sqlUpdate = "UPDATE contacto SET  nombre = :nombre, telefono = :telefono, instagram = :instagram, email = :email, direccion = :direccion, facebook = :facebook WHERE idContacto = :idContacto";
        $sentenciaUpdate = $conexion->prepare($sqlUpdate);
        $sentenciaUpdate->bindParam(':nombre', $nuevoNombre);
        $sentenciaUpdate->bindParam(':telefono', $nuevoTelefono);
        $sentenciaUpdate->bindParam(':instagram', $nuevoInstagram);
        $sentenciaUpdate->bindParam(':email', $nuevoEmail);
        $sentenciaUpdate->bindParam(':direccion', $nuevaDireccion);
        $sentenciaUpdate->bindParam(':facebook', $nuevofacebook); 
        $sentenciaUpdate->bindParam(':idContacto', $idContacto, PDO::PARAM_INT);

        if ($sentenciaUpdate->execute()) {
            echo json_encode(["mensaje" => "Contacto actualizado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar el contacto: " . implode(", ", $sentenciaUpdate->errorInfo())]);
        }
        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
