
<?php
require 'KeyAuth/api/1.0/index.php';

$KeyAuthApp = new KeyAuth\api\Api(
    "APP_NAME",
    "OWNER_ID",
    "APP_SECRET" 
);

function handleLogin() {
    global $KeyAuthApp;
    
    if(isset($_POST['username']) && isset($_POST['password'])) {
        $username = $_POST['username'];
        $password = $_POST['password'];
        
        $result = $KeyAuthApp->login($username, $password);
        if($result) {
            $_SESSION['user'] = $username;
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => "Invalid credentials"]);
        }
    }
}

function handleRegister() {
    global $KeyAuthApp;
    
    if(isset($_POST['username']) && isset($_POST['password']) && isset($_POST['email'])) {
        $username = $_POST['username'];
        $password = $_POST['password'];
        $email = $_POST['email'];
        
        $result = $KeyAuthApp->register($username, $password, $email);
        if($result) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => "Registration failed"]);
        }
    }
}

if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_GET['action'] ?? '';
    
    switch($action) {
        case 'login':
            handleLogin();
            break;
        case 'register':
            handleRegister();
            break;
    }
}
?>
