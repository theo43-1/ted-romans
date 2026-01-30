// sync.js - Synchronisation des données entre les pages

class DataSync {
    constructor() {
        this.currentUser = null;
        this.init();
    }
    
    init() {
        this.loadUser();
        this.setupListeners();
    }
    
    loadUser() {
        this.currentUser = JSON.parse(localStorage.getItem('ted_user') || '{}');
        return this.currentUser;
    }
    
    // Mettre à jour l'utilisateur
    updateUser(updatedData) {
        if (!this.currentUser.id) return false;
        
        // Mettre à jour les données
        Object.assign(this.currentUser, updatedData);
        this.currentUser.updatedAt = new Date().toISOString();
        
        // Sauvegarder dans localStorage
        localStorage.setItem('ted_user', JSON.stringify(this.currentUser));
        
        // Mettre à jour dans la liste des utilisateurs
        this.updateInUserList();
        
        // Déclencher un événement pour informer les autres pages
        this.triggerSyncEvent();
        
        return true;
    }
    
    updateInUserList() {
        const users = JSON.parse(localStorage.getItem('ted_users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex > -1) {
            users[userIndex] = {...this.currentUser};
            localStorage.setItem('ted_users', JSON.stringify(users));
        }
    }
    
    triggerSyncEvent() {
        // Créer un événement personnalisé
        const event = new CustomEvent('userDataUpdated', {
            detail: { user: this.currentUser }
        });
        window.dispatchEvent(event);
    }
    
    setupListeners() {
        // Écouter les événements de synchronisation
        window.addEventListener('userDataUpdated', (e) => {
            this.onUserDataUpdated(e.detail.user);
        });
        
        // Écouter les changements de localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'ted_user') {
                this.loadUser();
                this.updateUI();
            }
        });
    }
    
    onUserDataUpdated(updatedUser) {
        if (updatedUser.id === this.currentUser.id) {
            this.currentUser = updatedUser;
            localStorage.setItem('ted_user', JSON.stringify(updatedUser));
            this.updateUI();
        }
    }
    
    updateUI() {
        // Mettre à jour le nom dans la navigation
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && this.currentUser.name) {
            const firstName = this.currentUser.name.split(' ')[0];
            userNameElement.textContent = firstName;
        }
    }
}

// Initialiser la synchronisation
let dataSync = null;

document.addEventListener('DOMContentLoaded', () => {
    dataSync = new DataSync();
});

// Fonction globale pour mettre à jour l'utilisateur depuis n'importe quelle page
function syncUserUpdate(updatedData) {
    if (dataSync) {
        return dataSync.updateUser(updatedData);
    }
    return false;
}
