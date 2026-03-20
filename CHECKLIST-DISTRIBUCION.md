# ✅ CHECKLIST: DISTRIBUCIÓN DE AURA A CLIENTES

## 📋 ANTES DE PREPARAR EL PAQUETE

- [ ] Hice todos los cambios necesarios en el código
- [ ] Probé la aplicación localmente y funciona bien
- [ ] Actualicé la versión en `package.json` (si aplica)
- [ ] Tengo espacio suficiente en disco (~500 MB)
- [ ] Tengo conexión a internet (para npm)

---

## 🔨 PREPARACIÓN DEL PAQUETE

- [ ] Ejecuté: `chmod +x preparar-distribucion.sh`
- [ ] Ejecuté: `./preparar-distribucion.sh`
- [ ] El script terminó sin errores
- [ ] Se creó: `dist-cliente/AURA-1.0.0-Instalador.zip`
- [ ] Verifiqué el tamaño del ZIP (debe ser < 100 MB)

---

## 🧪 PRUEBA LOCAL (RECOMENDADO)

- [ ] Descomprimí el ZIP en otra carpeta
- [ ] Abrí el DMG y arrastré a una ubicación temporal
- [ ] La app abre correctamente
- [ ] Login funciona (admin/admin123)
- [ ] Navegación funciona (todas las secciones)
- [ ] Puedo crear un servicio de prueba
- [ ] Los datos se guardan correctamente

---

## 📝 DOCUMENTACIÓN PARA EL CLIENTE

- [ ] Verifiqué que `INSTRUCCIONES-INSTALACION.txt` está incluido
- [ ] Verifiqué que `MANUAL-CLIENTE.txt` está incluido
- [ ] Verifiqué que `LEEME.txt` está incluido
- [ ] Verifiqué que `instalar-para-cliente.sh` está incluido
- [ ] Las instrucciones son claras y fáciles de seguir

---

## 📧 PREPARACIÓN DEL EMAIL

- [ ] Personalicé la plantilla de email
- [ ] Incluí mi información de contacto
- [ ] Especifiqué credenciales (admin/admin123)
- [ ] Mencioné que debe cambiar la contraseña
- [ ] Incluí instrucciones básicas de instalación
- [ ] Ofrecí ayuda si tiene problemas

---

## 📤 ENVÍO AL CLIENTE

- [ ] Elegí el método de envío (email/Drive/WeTransfer)
- [ ] Subí el archivo `AURA-1.0.0-Instalador.zip`
- [ ] Verifiqué que el enlace funciona (si aplica)
- [ ] Envié el email con las instrucciones
- [ ] Guardé una copia del paquete para referencia

---

## 📞 SEGUIMIENTO

- [ ] Esperé confirmación de recepción del cliente
- [ ] Ofrecí ayuda para la instalación
- [ ] Estoy disponible para soporte técnico
- [ ] Tengo TeamViewer/AnyDesk listo (por si acaso)

---

## 🎯 POST-INSTALACIÓN

- [ ] El cliente confirmó que instaló AURA
- [ ] El cliente pudo hacer login
- [ ] El cliente cambió la contraseña inicial
- [ ] El cliente probó las funciones básicas
- [ ] Documenté qué versión tiene el cliente

---

## 📊 REGISTRO DE DISTRIBUCIÓN

**Completa esto para cada cliente:**

```
Cliente: ____________________
Fecha de envío: ____________________
Versión enviada: 1.0.0
Método de envío: ____________________
Email del cliente: ____________________
Instalación exitosa: [ ] Sí  [ ] No
Problemas reportados: ____________________
Notas adicionales: ____________________
```

---

## 🔄 PARA ACTUALIZACIONES FUTURAS

- [ ] Cambié la versión en `package.json`
- [ ] Documenté los cambios en la nueva versión
- [ ] Regeneré el paquete con `./preparar-distribucion.sh`
- [ ] Notifiqué al cliente sobre la actualización
- [ ] Expliqué que los datos NO se perderán
- [ ] Ofrecí ayuda para la actualización

---

## 💰 SI PLANEAS FIRMA PROFESIONAL

- [ ] Me inscribí en Apple Developer Program ($99/año)
- [ ] Esperé aprobación (1-2 días)
- [ ] Creé certificado "Developer ID Application"
- [ ] Configuré electron-builder con mi certificado
- [ ] Configuré notarización con Apple
- [ ] Probé el proceso de firma localmente
- [ ] Verifiqué que no hay advertencias de seguridad

---

## 🆘 SOPORTE AL CLIENTE

**Problemas comunes a anticipar:**

- [ ] Preparé solución para: "No se puede abrir"
- [ ] Preparé solución para: "La app está dañada"
- [ ] Preparé solución para: "No encuentro Terminal"
- [ ] Preparé solución para: "Error de base de datos"
- [ ] Tengo comandos de Terminal listos para compartir

**Comandos útiles a tener listos:**

```bash
# Remover cuarentena
xattr -cr /Applications/AURA.app && open /Applications/AURA.app

# Verificar instalación
ls -la /Applications/ | grep AURA

# Verificar base de datos
ls -la ~/Library/Application\ Support/AURA/
```

---

## 📈 MEJORA CONTINUA

Después de varias distribuciones:

- [ ] Recopilé feedback de los clientes
- [ ] Identifiqué problemas recurrentes
- [ ] Mejoré las instrucciones según el feedback
- [ ] Actualicé la plantilla de email
- [ ] Consideré agregar video tutorial
- [ ] Evaluó si vale la pena firma con Apple

---

## ✨ EXTRAS OPCIONALES

Para una experiencia más profesional:

- [ ] Creé video tutorial de instalación
- [ ] Creé video tutorial de uso básico
- [ ] Diseñé logo personalizado para el cliente
- [ ] Personalicé los colores según la marca del cliente
- [ ] Creé landing page con información de AURA
- [ ] Configuré sistema de tickets de soporte

---

## 🎉 CONFIRMACIÓN FINAL

Antes de enviar al cliente, confirma:

✅ El paquete está listo
✅ Lo probé localmente
✅ Las instrucciones están incluidas
✅ El email está preparado
✅ Estoy listo para dar soporte
✅ Guardé una copia del paquete

**SI TODOS LOS ✅ ESTÁN MARCADOS, ¡ENVÍA EL PAQUETE!** 🚀

---

## 📞 CONTACTOS DE EMERGENCIA

**Para ti (notas internas):**

```
Hosting de archivos:
- Google Drive: ____________________
- Dropbox: ____________________
- WeTransfer: Gratis hasta 2 GB

Soporte remoto:
- TeamViewer: https://www.teamviewer.com
- AnyDesk: https://anydesk.com

Apple Developer:
- Portal: https://developer.apple.com
- Soporte: https://developer.apple.com/support/

Recursos:
- Guía completa: GUIA-DISTRIBUCION-CLIENTES.md
- Resumen rápido: DISTRIBUIR-RESUMEN.txt
- Cómo distribuir: COMO-DISTRIBUIR.md
```

---

© 2026 AURA - Sistema de Gestión Funeraria

**Usa este checklist cada vez que distribuyas AURA a un nuevo cliente.**
