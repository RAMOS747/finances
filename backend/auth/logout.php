<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/helpers.php';

session_start();
session_destroy();
jsonOk(['mensaje' => 'Sesión cerrada']);
