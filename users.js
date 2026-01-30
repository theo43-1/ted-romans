// Gestion des utilisateurs
const UserManager = {
    // Initialiser les données utilisateurs
    init: function() {
        if (!localStorage.getItem('ted_users')) {
            // Créer quelques utilisateurs de test (optionnel)
            const testUsers = [
                {
                    id: '1',
                    name: 'Test Utilisateur',
                    email: 'test@tedromans.com',
                    password: 'test123',
                    joinedDate: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    subscription: {
                        plan: 'premium',
                        startDate: new Date().toISOString(),
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    preferences: {
                        theme: 'light',
                        fontSize: 16,
                        notifications: true
                    }
                }
            ];
            
            localStorage.setItem('ted_users', JSON.stringify(testUsers));
        }
    },
    
    // Obtenir tous les utilisateurs
    getAllUsers: function() {
        return JSON.parse(localStorage.getItem('ted_users') || '[]');
    },
    
    // Trouver un utilisateur par email
    findByEmail: function(email) {
        const users = this.getAllUsers();
        return users.find(user => user.email === email);
    },
    
    // Créer un nouvel utilisateur
    createUser: function(userData) {
        const users = this.getAllUsers();
        
        // Vérifier si l'utilisateur existe déjà
        if (this.findByEmail(userData.email)) {
            throw new Error('Un utilisateur avec cet email existe déjà');
        }
        
        // Créer l'utilisateur
        const newUser = {
            id: Date.now().toString(),
            ...userData,
            joinedDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            subscription: null,
            preferences: {
                theme: 'light',
                fontSize: 16,
                notifications: true
            }
        };
        
        users.push(newUser);
        localStorage.setItem('ted_users', JSON.stringify(users));
        
        // Connecter automatiquement l'utilisateur
        this.login(newUser.email, userData.password);
        
        return newUser;
    },
    
    // Connexion
    login: function(email, password) {
        const user = this.findByEmail(email);
        
        if (!user || user.password !== password) {
            throw new Error('Email ou mot de passe incorrect');
        }
        
        // Mettre à jour la dernière connexion
        user.lastLogin = new Date().toISOString();
        
        // Sauvegarder l'utilisateur connecté
        localStorage.setItem('ted_user', JSON.stringify(user));
        
        // Mettre à jour dans la liste des utilisateurs
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex > -1) {
            users[userIndex] = user;
            localStorage.setItem('ted_users', JSON.stringify(users));
        }
        
        return user;
    },
    
    // Déconnexion
    logout: function() {
        const user = this.getCurrentUser();
        if (user) {
            user.lastLogin = new Date().toISOString();
            localStorage.setItem('ted_user', JSON.stringify(user));
        }
        localStorage.removeItem('ted_user');
    },
    
    // Obtenir l'utilisateur actuel
    getCurrentUser: function() {
        return JSON.parse(localStorage.getItem('ted_user') || 'null');
    },
    
    // Mettre à jour l'utilisateur
    updateUser: function(userId, updates) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) {
            throw new Error('Utilisateur non trouvé');
        }
        
        // Mettre à jour l'utilisateur
        users[userIndex] = { ...users[userIndex], ...updates };
        
        // Sauvegarder
        localStorage.setItem('ted_users', JSON.stringify(users));
        
        // Si c'est l'utilisateur actuel, mettre à jour la session
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            localStorage.setItem('ted_user', JSON.stringify(users[userIndex]));
        }
        
        return users[userIndex];
    },
    
    // Changer le mot de passe
    changePassword: function(userId, currentPassword, newPassword) {
        const user = this.getAllUsers().find(u => u.id === userId);
        
        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }
        
        if (user.password !== currentPassword) {
            throw new Error('Mot de passe actuel incorrect');
        }
        
        if (newPassword.length < 6) {
            throw new Error('Le nouveau mot de passe doit contenir au moins 6 caractères');
        }
        
        return this.updateUser(userId, {
            password: newPassword,
            passwordChangedAt: new Date().toISOString()
        });
    }
};

// Initialiser le gestionnaire d'utilisateurs
UserManager.init();