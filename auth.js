// ==================== AUTHENTIFICATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Charger l'état depuis localStorage
    try {
        const savedData = localStorage.getItem('tedRomansApp');
        if (savedData) {
            const data = JSON.parse(savedData);
            AppState.currentUser = data.currentUser;
            AppState.favorites = data.favorites || [];
            AppState.isPremium = data.isPremium || false;
        }
    } catch (error) {
        console.error("Erreur lors du chargement:", error);
    }
    
    // Si l'utilisateur est déjà connecté, rediriger vers l'accueil
    if (AppState.currentUser && (window.location.pathname.includes('login.html') || 
                                 window.location.pathname.includes('register.html'))) {
        window.location.href = 'index.html';
        return;
    }
    
    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Validation simple
            if (!email || !password) {
                toastr.error('Veuillez remplir tous les champs');
                return;
            }
            
            // Simuler une connexion
            AppState.currentUser = {
                id: Date.now(),
                email: email,
                name: email.split('@')[0],
                joinedDate: new Date().toISOString()
            };
            
            // Sauvegarder
            saveAppState();
            
            toastr.success('Connexion réussie !');
            
            // Rediriger après un court délai
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    }
    
    // Gestion du formulaire d'inscription
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validation
            if (!name || !email || !password || !confirmPassword) {
                toastr.error('Veuillez remplir tous les champs');
                return;
            }
            
            if (password !== confirmPassword) {
                toastr.error('Les mots de passe ne correspondent pas');
                return;
            }
            
            if (password.length < 6) {
                toastr.error('Le mot de passe doit faire au moins 6 caractères');
                return;
            }
            
            // Simuler une inscription
            AppState.currentUser = {
                id: Date.now(),
                email: email,
                name: name,
                joinedDate: new Date().toISOString()
            };
            
            // Sauvegarder
            saveAppState();
            
            toastr.success('Inscription réussie ! Bienvenue ' + name + ' !');
            
            // Rediriger après un court délai
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    }
});

// Fonction pour sauvegarder l'état
function saveAppState() {
    try {
        localStorage.setItem('tedRomansApp', JSON.stringify(AppState));
    } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
    }
}