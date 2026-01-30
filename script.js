// ==================== GESTION UTILISATEUR SIMPLE ====================

// Vérifier si un utilisateur est connecté
function isUserLoggedIn() {
    const user = JSON.parse(localStorage.getItem('ted_user') || '{}');
    return user && user.email ? true : false;
}

// Obtenir l'utilisateur actuel
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('ted_user') || '{}');
}

// Mettre à jour l'interface selon l'état de connexion
function updateNavigation() {
    const user = getCurrentUser();
    const profileLink = document.getElementById('profile-link');
    const userName = document.getElementById('user-name');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    
    if (isUserLoggedIn()) {
        // UTILISATEUR CONNECTÉ
        if (profileLink) {
            profileLink.href = 'profile.html';
            profileLink.onclick = null; // Enlever tout ancien gestionnaire
        }
        
        if (userName) {
            const firstName = user.name ? user.name.split(' ')[0] : 'Mon Profil';
            userName.textContent = firstName;
        }
        
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Mon Profil';
            loginBtn.onclick = function(e) {
                e.preventDefault();
                window.location.href = 'profile.html';
            };
        }
        
        if (signupBtn) {
            signupBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Déco';
            signupBtn.onclick = function(e) {
                e.preventDefault();
                if (confirm('Voulez-vous vous déconnecter ?')) {
                    localStorage.removeItem('ted_user');
                    window.location.href = 'index.html';
                }
            };
        }
        
    } else {
        // UTILISATEUR NON CONNECTÉ
        if (profileLink) {
            profileLink.onclick = function(e) {
                e.preventDefault();
                showAuthModal('login');
            };
        }
        
        if (userName) {
            userName.textContent = 'Compte';
        }
        
        if (loginBtn) {
            loginBtn.innerHTML = 'Connexion';
            loginBtn.onclick = function(e) {
                e.preventDefault();
                showAuthModal('login');
            };
        }
        
        if (signupBtn) {
            signupBtn.innerHTML = 'Inscription';
            signupBtn.onclick = function(e) {
                e.preventDefault();
                showAuthModal('signup');
            };
        }
    }
}

// ==================== GESTION AUTHENTIFICATION ====================

// Fonction d'inscription
function handleSignup(name, email, password) {
    // Vérifier si l'email existe déjà
    const users = JSON.parse(localStorage.getItem('ted_users') || '[]');
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
        return { success: false, message: 'Un compte avec cet email existe déjà' };
    }
    
    // Créer le nouvel utilisateur
    const newUser = {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        password: password,
        joinedDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        subscription: null,
        avatar: null
    };
    
    // Sauvegarder
    users.push(newUser);
    localStorage.setItem('ted_users', JSON.stringify(users));
    localStorage.setItem('ted_user', JSON.stringify(newUser));
    
    return { success: true, user: newUser };
}

// Fonction de connexion
function handleLogin(email, password) {
    const users = JSON.parse(localStorage.getItem('ted_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return { success: false, message: 'Email ou mot de passe incorrect' };
    }
    
    // Mettre à jour la dernière connexion
    user.lastLogin = new Date().toISOString();
    localStorage.setItem('ted_user', JSON.stringify(user));
    
    // Mettre à jour dans la liste
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex > -1) {
        users[userIndex] = user;
        localStorage.setItem('ted_users', JSON.stringify(users));
    }
    
    return { success: true, user: user };
}

// ==================== INITIALISATION ====================

document.addEventListener('DOMContentLoaded', function() {
    // Mettre à jour la navigation
    updateNavigation();
    
    // Gestion du formulaire d'inscription
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm').value;
            
            // Validation
            if (password !== confirmPassword) {
                alert('Les mots de passe ne correspondent pas');
                return;
            }
            
            if (password.length < 6) {
                alert('Le mot de passe doit avoir au moins 6 caractères');
                return;
            }
            
            const result = handleSignup(name, email, password);
            
            if (result.success) {
                alert('Inscription réussie ! Bienvenue ' + name);
                document.getElementById('auth-modal').classList.add('hidden');
                updateNavigation();
                window.location.href = 'profile.html';
            } else {
                alert('Erreur : ' + result.message);
            }
        });
    }
    
    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            const result = handleLogin(email, password);
            
            if (result.success) {
                alert('Connexion réussie ! Bienvenue ' + result.user.name);
                document.getElementById('auth-modal').classList.add('hidden');
                updateNavigation();
                window.location.href = 'profile.html';
            } else {
                alert('Erreur : ' + result.message);
            }
        });
    }
});


// ==================== TOASTS ====================
function showToast(message, type = 'info') {
    if (typeof toastr !== 'undefined') {
        const options = {
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-top-right',
            timeOut: 3000
        };
        
        switch (type) {
            case 'success':
                toastr.success(message, 'Succès', options);
                break;
            case 'error':
                toastr.error(message, 'Erreur', options);
                break;
            case 'warning':
                toastr.warning(message, 'Attention', options);
                break;
            default:
                toastr.info(message, 'Information', options);
        }
    } else {
        // Fallback simple
        console.log(`${type.toUpperCase()}: ${message}`);
        // Créer un toast simple
        const toast = document.createElement('div');
        toast.className = `simple-toast ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48BB78' : type === 'error' ? '#F56565' : type === 'warning' ? '#ECC94B' : '#4299E1'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// ==================== VARIABLES GLOBALES ====================
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let novels = [];
let currentNovel = null;
let currentPage = 1;
let totalPages = 5;
let userSubscription = localStorage.getItem('userSubscription') || 'free';
let isInitialized = false;

// ==================== ROMANS COMPLETS ====================
const demoNovels = [
    {
        id: 1,
        title: "Ma Prof, mon cœur ",
        author: "TEDDY TED",
        genre: ["Amour interdit","Transformation","Secrets"],
        cover: "images/teddy.png",
        description: "Un roman captivant en 39 chapitres. Mystère et aventure vous attendent.",
        chapters: 39,
        rating: 4.8,
        readers: 2450,
        favorite: false,
        pages: 20,
        novelChapters: {
            1: {
                title: "Chapitre 1 – La nouvelle prof",
                content: `<p>Teddy Nagatoro arriva en retard. Encore une fois. Quand il poussa la porte de la salle 215, tous les regards se tournèrent vers lui. Mais lui, comme d'habitude, ne semblait pas s'en soucier.</p>

                <p><em>— « T'es à la bourre, Nagatoro », souffla un camarade avec un sourire.</em> Teddy haussa les épaules et alla s'asseoir tout au fond, près de la fenêtre. Il sortit son cahier, le jeta sur la table, puis s'affala sur sa chaise. Il savait qu'il allait encore s'ennuyer.</p>
                
                <p>Mais aujourd'hui, ce n'était pas un jour comme les autres. Une nouvelle prof venait d'arriver. Madame Julie Kizame. Elle écrivait son nom au tableau, sans se retourner. Sa silhouette était fine, droite, presque rigide. Elle portait une robe noire simple et ses cheveux étaient attachés en queue-de-cheval. Elle avait l'air sévère.</p>
                
                <p>Quand elle se retourna, tout le monde se tut. Même Teddy leva les yeux, un peu curieux.</p>
                
                <p><em>— « Bonjour. Je suis Julie Kizame, votre nouvelle prof de littérature. Je ne suis pas là pour vous faire plaisir. Je suis là pour vous faire réfléchir. Si vous n'êtes pas prêts, la porte est juste là. »</em> Personne ne bougea.</p>
                
                <p>Teddy sourit dans sa barbe. <em>Encore une prof qui croit qu'elle va changer le monde</em>, pensa-t-il. Mais quelque chose chez elle attira son regard. Ses yeux. Froids. Profonds. Et cette voix… calme, mais ferme. Il ne comprenait pas pourquoi, mais il avait envie de la faire craquer. Pas juste la mettre en colère comme avec les autres profs. Non. Il voulait la faire réagir. La faire rire. La faire rougir, peut-être.</p>
                
                <p>Quelques minutes plus tard, alors qu'elle parlait de Victor Hugo, Teddy leva la main.</p>
                
                <p><em>— « Excusez-moi, madame… mais c'est vrai que Hugo avait une femme et une maîtresse en même temps ? »</em> Des rires éclatèrent dans la salle.</p>
                
                <p>Julie s'arrêta. Le regarda. Longuement. <em>— « Je vois que vous connaissez au moins une chose sur lui, monsieur Nagatoro. Peut-être qu'un jour, vous lirez un de ses livres. »</em></p>
                
                <p>Teddy sourit. Elle connaissait son nom. Intéressant.</p>`
            },
            2: {
                title: "Chapitre 2 – Le regard de trop",
                content: `<p>Le cours du lendemain était à neuf heures. Teddy n'avait pas prévu d'arriver à l'heure. Mais ce matin-là, il s'était réveillé tôt. Trop tôt. Et sans savoir pourquoi, il s'était habillé plus vite que d'habitude.</p>

                <p>Quand il entra dans la salle, Julie Kizame était déjà là, en train de préparer le tableau. Elle portait une chemise blanche et une jupe noire. Simple, mais élégante. Sa nuque dégagée, ses gestes précis... Tout chez elle semblait calculé. Parfait.</p>
                
                <p>Teddy s'installa au fond, comme toujours. Il ne dit rien. Mais ses yeux, eux, parlaient. Il la regardait. En cachette. Quand elle tournait le dos, quand elle effaçait quelque chose au tableau. Mais chaque fois qu'elle se retournait, il baissait les yeux, vite. Comme un voleur pris en flagrant délit.</p>
                
                <p>Julie, de son côté, avait remarqué. Pas les regards. Pas encore. Mais une tension légère. Un silence inhabituel venant de Teddy Nagatoro. Il ne chahutait pas. Il ne faisait pas de remarques idiotes. Il écoutait. Ou plutôt, il faisait semblant d'écouter. Mais elle sentait qu'il était ailleurs. Et elle détestait ça : ne pas pouvoir lire un élève.</p>
                
                <p><em>— « Monsieur Nagatoro ? »</em> Teddy sursauta. Il releva la tête. <em>— « Euh... oui, madame ? »</em></p>
                
                <p><em>— « Pouvez-vous nous dire ce que Baudelaire voulait dire par "Tu m'as donné ta boue et j'en ai fait de l'or" ? »</em> Un blanc. Il avait entendu la phrase, mais pas le sens.</p>
                
                <p><em>— « Peut-être... qu'il parle de transformer les choses moches en trucs beaux ? »</em> Quelques rires.</p>
                
                <p>Julie resta calme. <em>— « C'est une réponse assez vague, mais pas idiote. Vous pouvez approfondir pour la semaine prochaine. Je veux un court texte, signé de votre main. »</em></p>
                
                <p>Teddy hocha la tête sans répondre. Il avait chaud. Il n'aimait pas être exposé. Encore moins devant elle.</p>
                
                <p>À la fin du cours, alors que la salle se vidait, Julie rangeait ses affaires. Teddy s'apprêtait à partir, puis s'arrêta un instant à la porte. Il tourna la tête, comme s'il allait lui dire quelque chose. Mais il ne dit rien. Il baissa les yeux. Et sortit.</p>
                
                <p>Julie le suivit du regard, un léger sourire au coin des lèvres. <em>Il a peur. Mais il regarde. Intéressant.</em></p>` },

            3: { title: "Chapitre 3 – Le défi", content:  `<p>Le mercredi suivant, la salle était presque pleine. Teddy entra parmi les derniers. Il n'avait pas oublié le devoir que Julie lui avait donné. Mais il n'avait pas non plus écrit une ligne.</p>

            <p>Il s'installa au fond, le cœur un peu lourd. Ce n'était qu'un petit texte. Rien d'extraordinaire. Et pourtant, il n'avait pas osé l'écrire. Peut-être parce qu'il avait peur qu'elle le lise. Vraiment. Et qu'elle voie plus que des mots.</p>
            
            <p>Julie entra, comme d'habitude, avec son calme habituel. Pas de sourire. Pas de pause inutile. Elle posa ses affaires, regarda la classe, puis sortit une pile de feuilles.</p>
            
            <p><em>— « Ceux qui m'ont rendu le petit devoir, venez déposer vos copies. Les autres, vous savez ce que ça signifie. »</em></p>
            
            <p>Teddy sentit son cœur battre un peu plus vite. Il resta assis. Les autres se levaient, avançaient, posaient leurs feuilles. Julie comptait.</p>
            
            <p>Elle releva la tête. <em>— « Monsieur Nagatoro ? Rien à me remettre ? »</em></p>
            
            <p>Teddy hésita. Puis fit un geste de la tête, comme pour dire "non". Julie hocha légèrement la tête. Elle ne montra aucune émotion. Mais au fond, elle était déçue. Elle pensait qu'il aurait au moins essayé.</p>
            
            <p>Après le cours, alors que la plupart des élèves partaient, elle l'arrêta d'un simple mot : <em>— « Un instant. »</em></p>
            
            <p>Il s'arrêta, surpris. Il se retourna lentement. <em>— « Oui, madame ? »</em></p>
            
            <p><em>— « Vous aviez une chance, Teddy. Une chance de me montrer ce que vous avez dans la tête. Et vous l'avez jetée. »</em> Il ne répondit pas. Il la fixait, mal à l'aise, comme un gosse pris la main dans le sac.</p>
            
            <p><em>— « Vous aimez bien regarder les gens de loin, mais vous avez peur qu'on vous regarde de près. C'est dommage. »</em> Il ouvrit la bouche pour dire quelque chose, mais elle le coupa.</p>
            
            <p><em>— « Voilà ce que je vous propose. Un autre texte. Deux pages. Cette fois, vous écrivez sur vous. Sans tricher. Sans faire le malin. Vous avez jusqu'à lundi. »</em> Teddy fronça les sourcils.</p>
            
            <p><em>— « Et si je refuse ? »</em></p>
            
            <p>Julie croisa les bras. <em>— « Alors je considérerai que vous n'avez aucun intérêt pour la littérature, ni pour ce cours. Et je ne perdrai plus mon temps avec vous. »</em></p>
            
            <p>Il la regarda, longtemps. Elle était belle. Brillante. Fière. Mais surtout... elle le voyait. Plus que les autres.</p>
            
            <p>Il hocha la tête. <em>— « D'accord. Deux pages. Vraies. Promis. »</em></p>
            
            <p><em>— « Bien. Vous pouvez partir. »</em> Il sortit sans un mot de plus.</p>
            
            <p>Mais dans sa tête, les choses avaient changé. Il voulait lui prouver qu'il valait mieux que ce qu'elle pensait. Peut-être pas pour les bonnes raisons. Mais il allait écrire.</p>` },
            4: { title: "Chapitre 4 – Entre deux mondes", content: `<p>Depuis quelques jours, Teddy se sentait différent. Il passait plus de temps sur ses devoirs. Il lisait des extraits de romans, même quand ce n'était pas demandé. Il ne comprenait pas tout, mais il sentait que ça lui faisait du bien. Et puis... il pensait à elle. Julie Kizame.</p>

            <p>Il n'osait pas encore lui parler trop longtemps, mais à chaque fois qu'elle le regardait un peu plus que les autres, il sentait son cœur battre plus vite. Un mélange de peur et d'excitation. Mais ce jeudi matin, tout bascula.</p>
            
            <p>Il était en classe avec ses potes. Yuki, Kenji, et Sota. Trois gars bruyants, drôles, mais pas très portés sur la littérature. Quand Julie entra, calme comme toujours, posée comme une reine, Teddy sentit tout de suite qu'il devait se tenir à carreau.</p>
            
            <p>Mais Kenji lui souffla à l'oreille : <em>— « Elle est grave bonne, la prof, aujourd'hui, t'as vu ? Vas-y, balance-lui un mot, toi t'es son préféré. »</em> Teddy fit mine de rire. <em>— « Grave. Elle me kiffe, t'inquiète. »</em></p>
            
            <p>Et sans réfléchir, il lança à voix haute : <em>— « Madame, si vous continuez à vous habiller comme ça, je vais devoir redoubler exprès. »</em> Un grand silence dans la classe. Quelques rires nerveux.</p>
            
            <p>Julie leva les yeux vers lui. Son regard était glacial. <em>— « Sortez, monsieur Nagatoro. Immédiatement. »</em> Il se figea. Elle n'avait même pas crié. Mais c'était pire que si elle l'avait fait. <em>— « Vous avez cru que j'étais votre camarade ? Vous repasserez. »</em></p>
            
            <p>Teddy se leva lentement. Ses potes le regardaient avec des sourires idiots. Mais lui, il ne souriait pas. Il venait de tout gâcher.</p>
            
            <p>Il passa le reste de l'heure dans le couloir, dos contre le mur. Il n'en menait pas large. Il n'avait pas seulement été puni. Il avait déçu Julie. Et ça, c'était pire que n'importe quelle punition.</p>
            
            <p>Après le cours, il voulut partir discrètement. Mais la porte s'ouvrit. Julie sortit. Elle le vit. Le fixa. Elle s'approcha. <em>— « Je croyais que vous vouliez changer. »</em> Il baissa les yeux. <em>— « Je suis désolé… C'était idiot. Je voulais juste faire le malin devant mes potes. »</em></p>
            
            <p><em>— « Et c'est eux que vous voulez impressionner ? Ou moi ? »</em> Il releva la tête, surpris. Julie s'approcha encore, juste assez pour que sa voix soit plus douce. <em>— « Vous ne pouvez pas jouer sur deux tableaux, Teddy. Choisissez. »</em></p>
            
            <p>Elle le laissa là, seul dans le couloir. Et pour la première fois depuis longtemps, il regretta vraiment ses mots.</p>` },
            5: { title: "Chapitre 5 – Trop, c’est trop", content: `<p>Une semaine était passée depuis l'incident en classe. Depuis, Teddy avait changé d'attitude. Il n'osait plus plaisanter. Il venait en cours à l'heure. Il notait tout ce que Julie écrivait. Même ses amis le taquinaient : <em>— « Eh bah, Nagatoro, t'as retourné ta veste ou quoi ? »</em> <em>— « Ta gueule, Kenji. »</em> La réponse était sèche.</p>

            <p>Teddy ne voulait plus faire le clown. Il voulait qu'elle le respecte. Ce mardi-là, après un bon cours, Julie fit asseoir tout le monde pour un exercice de groupe. Chaque élève devait lire un extrait à voix haute, puis l'expliquer à son voisin.</p>
            
            <p>Julie passait entre les rangs, écoutait, corrigeait doucement. Teddy se retrouva avec Aiko, une fille discrète mais gentille. Elle lut son texte. Et quand ce fut à Teddy de lire, il se lança, un peu nerveux, mais appliqué.</p>
            
            <p>Julie arriva derrière lui, silencieuse. <em>— « Continue », dit-elle doucement.</em> Mais Teddy, concentré sur sa feuille, ne l'avait pas entendue arriver. Il continua, puis se tourna vers Aiko et lui dit en rigolant : <em>— « Bon, ça reste du blabla littéraire hein, faut pas se mentir. »</em></p>
            
            <p>Julie était juste derrière. Un silence. Teddy se figea, sentant l'air changer autour de lui. Julie s'approcha, posa une main sur sa table, calme. <em>— « Du blabla littéraire ? C'est ça, ton niveau d'analyse maintenant ? »</em> Teddy devint pâle. <em>— « Non… non, je voulais pas dire ça comme ça… »</em></p>
            
            <p><em>— « Tu crois que parce que tu fais quelques efforts, tu peux insulter ce que tu ne comprends pas ? Tu veux jouer à l'homme, Teddy ? Alors commence par respecter ce que tu ne maîtrises pas encore. »</em> Toute la classe les regardait. Aiko baissa les yeux, mal à l'aise.</p>
            
            <p>Julie s'éloigna, reprit son calme, comme si rien ne s'était passé. Mais pour Teddy, c'était un coup de plus. Il n'avait pas voulu être méchant. Juste faire une blague. Détendre l'ambiance. Mais il avait blessé Julie. Encore.</p>
            
            <p>Après le cours, il attendit dehors. Il ne savait pas pourquoi. Julie passa près de lui, sans s'arrêter. Il prit son courage à deux mains. <em>— « Je suis désolé. Ce n'était pas contre vous. J'ai été maladroit. »</em></p>
            
            <p>Julie s'arrêta. Elle resta silencieuse un moment, puis dit : <em>— « Tu veux changer, Teddy. Je le vois. Mais tu dois savoir que chaque mot compte. Et les mots... c'est ma vie. Alors si tu veux marcher dans ce monde, commence par les respecter. »</em></p>
            
            <p>Elle le regarda droit dans les yeux. <em>— « Ce sera ta dernière erreur tolérée. La prochaine, je ne t'adresserai plus la parole. »</em> Puis elle s'éloigna, laissant Teddy seul avec ses regrets.</p>` },
            6: { title: "Chapitre 6 – Le bon côté", content:  `<p>Une semaine était passée depuis l'incident en classe. Depuis, Teddy avait changé d'attitude. Il n'osait plus plaisanter. Il venait en cours à l'heure. Il notait tout ce que Julie écrivait. Même ses amis le taquinaient : <em>— « Eh bah, Nagatoro, t'as retourné ta veste ou quoi ? »</em> <em>— « Ta gueule, Kenji. »</em> La réponse était sèche.</p>
            <p>Teddy ne voulait plus faire le clown. Il voulait qu'elle le respecte. Ce mardi-là, après un bon cours, Julie fit asseoir tout le monde pour un exercice de groupe. Chaque élève devait lire un extrait à voix haute, puis l'expliquer à son voisin.</p>
            <p>Julie passait entre les rangs, écoutait, corrigeait doucement. Teddy se retrouva avec Aiko, une fille discrète mais gentille. Elle lut son texte. Et quand ce fut à Teddy de lire, il se lança, un peu nerveux, mais appliqué.</p>
            <p>Julie arriva derrière lui, silencieuse. <em>— « Continue », dit-elle doucement.</em> Mais Teddy, concentré sur sa feuille, ne l'avait pas entendue arriver. Il continua, puis se tourna vers Aiko et lui dit en rigolant : <em>— « Bon, ça reste du blabla littéraire hein, faut pas se mentir. »</em></p>
            <p>Julie était juste derrière. Un silence. Teddy se figea, sentant l'air changer autour de lui. Julie s'approcha, posa une main sur sa table, calme. <em>— « Du blabla littéraire ? C'est ça, ton niveau d'analyse maintenant ? »</em> Teddy devint pâle. <em>— « Non… non, je voulais pas dire ça comme ça… »</em></p>
            <p><em>— « Tu crois que parce que tu fais quelques efforts, tu peux insulter ce que tu ne comprends pas ? Tu veux jouer à l'homme, Teddy ? Alors commence par respecter ce que tu ne maîtrises pas encore. »</em> Toute la classe les regardait. Aiko baissa les yeux, mal à l'aise.</p>
            <p>Julie s'éloigna, reprit son calme, comme si rien ne s'était passé. Mais pour Teddy, c'était un coup de plus. Il n'avait pas voulu être méchant. Juste faire une blague. Détendre l'ambiance. Mais il avait blessé Julie. Encore.</p>
            <p>Après le cours, il attendit dehors. Il ne savait pas pourquoi. Julie passa près de lui, sans s'arrêter. Il prit son courage à deux mains. <em>— « Je suis désolé. Ce n'était pas contre vous. J'ai été maladroit. »</em></p>
            <p>Julie s'arrêta. Elle resta silencieuse un moment, puis dit : <em>— « Tu veux changer, Teddy. Je le vois. Mais tu dois savoir que chaque mot compte. Et les mots... c'est ma vie. Alors si tu veux marcher dans ce monde, commence par les respecter. »</em></p>
            <p>Elle le regarda droit dans les yeux. <em>— « Ce sera ta dernière erreur tolérée. La prochaine, je ne t'adresserai plus la parole. »</em> Puis elle s'éloigna, laissant Teddy seul avec ses regrets.</p>` },
            7: { title: "Chapitre 7 – L’écho du passé", content:`<p>Depuis l'histoire de la boulette, il n'avait plus tenté d'approcher Julie. Il ne levait plus la main en classe. Il venait, s'asseyait au fond, prenait des notes sans enthousiasme. Elle aussi l'ignorait, avec une froideur polie. Pas de regard. Pas de mot. Il s'était replié sur lui-même.</p>
            <p>Et il savait pourquoi. Ce n'était pas la première fois qu'il trahissait la confiance d'un adulte. Depuis son arrivée à la fac, il avait enchaîné les provocations.</p>
            <p>Avec le prof d'histoire, il avait claqué la porte en plein exposé, lançant : <em>— « Vos cours, c'est du musée, ça m'endort. »</em> Avec celle de biologie, il avait refusé un devoir, expliquant : <em>— « J'vais pas faire une fiche sur des plantes, j'suis pas jardinier. »</em></p>
            <p>Même le prof d'éducation civique, pourtant bienveillant, avait baissé les bras après une séance où il s'était permis de rire en plein débat sur la pauvreté. À chaque fois, c'était un mot, un rire, un regard insolent. Juste assez pour briser le lien. Mais jamais assez pour qu'on l'exclue.</p>
            <p>Un jour, en rentrant plus tôt que prévu de la bibliothèque, il passa près d'une salle où plusieurs profs discutaient, porte entrouverte. Il reconnut une voix : celle de monsieur Takahashi, son prof d'histoire. <em>— « Le petit Nagatoro ? Un gamin arrogant, paresseux, irrespectueux. Je n'ai jamais vu ça. »</em></p>
            <p>Une autre voix enchaîna. <em>— « Avec moi pareil. Il pense qu'il est au-dessus de tout. À croire qu'on ne lui a jamais dit non dans sa vie. »</em> Puis une troisième, plus calme… mais plus dure. <em>— « Moi, je l'ai vu essayer de changer. Mais il recule à chaque fois qu'on attend un pas de lui. Il gâche sa chance. Il gâche son potentiel. »</em></p>
            <p>C'était Julie. Il s'arrêta. Le cœur lourd. Il n'était pas censé entendre ça. Mais c'était trop tard. Il recula doucement, sans bruit, et quitta le couloir.</p>
            <p>Ce soir-là, dans sa chambre, il resta assis longtemps. Pas de musique. Pas de messages. Pas de potes. Juste lui… et cette vérité brutale : Il était devenu ce que tout le monde détestait. Même elle.</p>` },
            8: { title: "Chapitre 8 – Le silence intérieur", content: `<p>Il avait arrêté de sortir avec les autres. Plus de blagues, plus de moqueries, plus de Kenji. Même Sota ne le reconnaissait plus. Il venait en cours, le regard flou, les traits tirés. On aurait dit un fantôme.</p>
            <p>Ceux qui avaient l'habitude de rire de ses provocations le regardaient désormais avec un mélange de curiosité et de pitié. Le "mec insolent" était devenu invisible.</p>
            <p>Un soir, il resta seul sur un banc, à côté du vieux bâtiment de la fac de lettres. Personne ne passait par là à cette heure. Il regarda le ciel. Pas d'étoiles. Juste une masse grise, lourde.</p>
            <p>Il se demandait depuis plusieurs jours : <em>Pourquoi est-ce que je me suis comporté comme ça ?</em> Il avait toujours cru qu'être vu comme un rebelle, un dur, c'était une manière d'exister. Mais en vérité… c'était juste une façon d'éviter de se sentir faible.</p>
            <p>Depuis petit, il n'avait jamais eu de vrais repères. Son père était rarement là. Sa mère l'aimait, mais était fatiguée. Il avait appris à se débrouiller seul. Et pour survivre dans un monde froid, il s'était inventé un masque. Ce masque, c'était l'arrogance.</p>
            <p>Mais maintenant, ce masque le brûlait de l'intérieur. Il repensa à Julie. Elle avait vu au-delà de l'image. Elle avait tenté de l'aider. Elle lui avait parlé comme à un adulte. Et lui, à chaque fois, il avait tout gâché.</p>
            <p>Pas par méchanceté. Mais par peur. Peur de décevoir. Peur de ne pas être à la hauteur. Peur de… l'aimer trop, peut-être. Le banc était froid. Il serra son manteau. Il était seul.</p>
            <p>Et c'est dans ce silence qu'il comprit une chose : <em>S'il voulait changer, il devait d'abord affronter ce qu'il fuyait depuis toujours : lui-même.</em></p>` },
            9: { title: "Chapitre 9 – Dans les marges", content: `<p>Il avait repris un vieux livre du programme : Les Fleurs du vide, un roman que Julie avait évoqué dès les premières semaines de cours. Avant, il avait survolé les pages sans y prêter attention. Maintenant, il lisait lentement, crayon à la main, soulignant des phrases, gribouillant des remarques dans les marges.</p>
            <p>Il ne le faisait pas pour la note. Il le faisait pour comprendre.</p>
            <p>En classe, il s'était replacé au deuxième rang. Pas devant, pas au fond. Juste assez proche pour entendre chaque mot. Il ne parlait pas. Ne levait pas la main. Mais il écoutait. Réellement.</p>
            <p>Les autres, eux, avaient l'habitude de l'entendre faire des remarques ou ricaner. Là, rien. Silence.</p>
            <p>Un jour, Julie passa dans les rangs, comme d'habitude. Elle s'arrêta à côté de lui quelques secondes. Elle jeta un rapide coup d'œil à son cahier. Elle vit des notes soignées. Des citations soulignées. Une question écrite à la main : <em>Pourquoi l'auteur insiste-t-il autant sur le vide intérieur ? Est-ce une forme de liberté ?</em></p>
            <p>Elle ne dit rien. Mais dans ses yeux, un éclair. Léger. Quelque chose venait de se fissurer.</p>
            <p>Il la regardait parfois en cours. Pas comme avant. Plus de regards insistants, charmeurs, provocateurs. Non. Maintenant, c'était un regard curieux, admiratif, respectueux.</p>
            <p>Il observait sa manière d'expliquer. Ses gestes discrets quand elle corrigeait un mot. Son regard quand elle parlait d'un poème avec passion. Et parfois, leurs regards se croisaient.</p>
            <p>Mais aucun des deux ne détournait les yeux. Ils restaient là. Juste quelques secondes. Silencieux. Comme si tout était en train de changer, sans que personne ne le dise.</p>` },
            10: { title: "Chapitre 10 – Le murmure des autres", content: 
             `<p>Ce matin-là, le soleil filtrait doucement à travers les vitres de la salle 204. Le cours de littérature venait de finir. Les étudiants quittaient la salle lentement, certains discutant, d'autres les écouteurs déjà dans les oreilles.</p>
             <p>Lui, il rangeait ses affaires calmement. Plus de gestes brusques. Plus d'agitation. Julie était encore au tableau, rangeant ses feuilles, comme toujours. Il ne la regarda pas. Pas cette fois.</p>
             <p>Mais dans le couloir, une voix le fit s'arrêter. <em>— « T'as changé, Nagatoro. »</em> C'était monsieur Takahashi. Le prof d'histoire. Celui-là même qui, quelques jours plus tôt, parlait de lui comme d'un cas perdu.</p>
             <p>Il se tenait près de la machine à café, les bras croisés. <em>— « T'es plus le même qu'en début d'année. T'écoutes, tu notes, tu ne participes pas encore, mais… ça viendra. »</em> Il ne répondit pas tout de suite. Surpris. <em>— « Je… j'essaie, c'est tout. »</em></p>
             <p>Takahashi sourit, sans ironie. <em>— « Continue. Ça se voit. Même tes camarades le sentent. »</em> Puis il s'éloigna.</p>
             <p>Dans les couloirs, certains élèves le saluaient à présent d'un signe de tête. Rien de grand, mais plus de moqueries, plus de soupirs excédés. Même Sota, en le croisant à la cafétéria, lui lança : <em>— « T'as lu ton premier livre sérieux, frère ? On t'a perdu pour de bon ou c'est juste une pause ? »</em></p>
             <p>Il avait souri, sans répondre. Il n'était pas encore prêt à tout expliquer.</p>
             <p>Un jour, après un exposé en petit groupe, alors qu'il feuilletait un recueil de poèmes, une fille de sa promo s'était penchée vers lui, curieuse. <em>— « Tu bosses sur ça pour un devoir ? »</em> <em>— « Non. Pour moi. »</em> Elle avait hoché la tête, un peu surprise. Puis elle s'était éloignée. Mais il avait senti, dans son regard, un respect discret.</p>
             <p>Et Julie ? Elle ne disait rien. Mais il sentait, parfois, qu'elle observait. Quand elle faisait semblant de réorganiser ses papiers… ou qu'elle s'attardait un peu trop longtemps près de son bureau. Pas un mot. Pas un geste.</p>
             <p>Mais une tension douce. Comme si quelque chose était en train de naître, lentement. À petits pas.</p>` },
            11: { title: "Chapitre 11 – En dehors des murs", content:
             `<p>L'annonce avait été faite à la fin du cours de littérature : <em>« La faculté organise une sortie pédagogique au musée d'art classique de Kyoto. C'est facultatif, mais conseillé. Ceux qui participeront devront rendre un petit carnet de lecture sur l'exposition. »</em></p>
             <p>Julie avait donné l'information sans insister. Mais il avait levé les yeux, attentif. Kyoto. Une ville ancienne, chargée d'histoire, de poésie, d'ombres élégantes. Et surtout… un prétexte pour être près d'elle, sans que ça ne paraisse étrange.</p>
             <p>Le matin du départ, les étudiants s'étaient rassemblés devant la fac, dans la fraîcheur légère du printemps japonais. La plupart plaisantaient, sortaient leurs téléphones, prenaient des photos. Lui, il était venu seul. Silencieux. Il portait un carnet dans son sac. Et un recueil de haïkus emprunté à la bibliothèque.</p>
             <p>Julie était là aussi, un manteau beige léger sur les épaules, entourée de quelques collègues. Elle ne le regarda pas. Mais il sentit, à un moment, son regard glisser jusqu'à lui. À peine une seconde. Presque rien.</p>
             <p>Dans le car, il s'était installé côté fenêtre, un peu à l'écart. Mais pas tout à fait derrière. Il voulait observer sans s'effacer. Sur la route, les paysages défilaient : rizières, forêts, maisons de bois. Et dans son carnet, il écrivait de petites notes. Pas très littéraires. Mais vraies.</p>
             <p><em>« Le silence de la route est plus doux que le bruit des cours. »</em> <em>« Elle est juste deux rangs plus loin. Mais elle semble vivre dans un autre monde. »</em></p>
             <p>Au musée, les étudiants s'éparpillèrent. Certains prenaient des photos, d'autres lisaient les panneaux distraitement. Lui, il observait chaque toile. Devant un vieux rouleau illustré, il resta longtemps immobile.</p>
             <p>Une peinture ancienne, représentant une femme noble lisant une lettre. Son regard, mélancolique, semblait venir d'un autre temps. <em>— « Cette œuvre est inspirée du Dit du Genji. »</em> La voix était douce. Près de lui. C'était elle. Julie. Debout à côté de lui. Les mains jointes dans son dos.</p>
             <p>Il hocha la tête, sans oser parler tout de suite. <em>— « Tu l'as lu ? » demanda-t-elle doucement.</em> <em>— « Pas en entier. Mais… j'ai lu des extraits. » Il hésita. « J'aime bien quand les mots… ne disent pas tout. »</em></p>
             <p>Elle le regarda un moment, comme surprise. Puis elle sourit. Léger. Vrai. <em>— « C'est déjà beaucoup. »</em> Et elle s'éloigna. Mais cette fois, quelque chose était resté entre eux. Un fil ténu. Silencieux. Mais solide.</p>` },
            12: { title: "Chapitre 12 – Entre les murs du silence", content:
             `<p>Le groupe avait fini la visite guidée. Les étudiants s'étaient dispersés dans le grand jardin du musée pour profiter de la pause. Certains bavardaient, d'autres prenaient des photos près des cerisiers en fleurs. Lui s'était éloigné. Lentement. Il avait longé les couloirs vides de l'aile ouest, là où plus personne ne traînait.</p>
             <p>Des salles silencieuses, baignées d'une lumière douce et dorée. Le genre d'endroit où même les pas semblaient demander pardon. Il entra dans une pièce circulaire, déserte.</p>
             <p>Au centre, une peinture ancienne suspendue : un paysage enneigé, une petite cabane au loin, et un homme seul, assis dans la neige, tourné vers l'invisible. Il resta là. Longtemps.</p>
             <p><em>— « Elle est belle, n'est-ce pas ? »</em> Il sursauta presque. Il ne l'avait pas entendue arriver. Julie. Elle entra lentement dans la pièce, son manteau légèrement entrouvert, une écharpe crème autour du cou.</p>
             <p>Elle ne le regardait pas encore. Ses yeux étaient posés sur la toile. <em>— « J'ai toujours aimé cette œuvre. Il y a quelque chose de... pur, dans cette solitude. »</em> Il hocha la tête. <em>— « On dirait qu'il attend quelqu'un. »</em></p>
             <p>Elle tourna alors légèrement le regard vers lui. <em>— « Ou peut-être qu'il apprend à ne plus attendre. »</em> Un silence. Pas gênant. Plutôt… chargé.</p>
             <p>Il sentit son cœur battre un peu plus fort. Pas à cause du regard. Pas à cause du décor. À cause du moment. <em>— « Je… je suis désolé. »</em> Il n'avait pas prévu de le dire. C'était sorti seul. Comme un mot coincé depuis des semaines.</p>
             <p>Elle fronça légèrement les sourcils. <em>— « Désolé de quoi ? »</em> Il baissa les yeux, puis regarda à nouveau la toile. <em>— « D'avoir été… ce genre d'étudiant. Celui que tout le monde déteste. Celui qui gâche tout. »</em></p>
             <p>Elle ne répondit pas tout de suite. Puis, doucement : <em>— « Tu n'étais pas ce genre d'étudiant. Tu l'es devenu. Par choix. Ou par peur. Mais ce n'est pas ce que tu es. »</em> Un frisson le traversa. <em>— « Et si je ne sais pas qui je suis ? »</em></p>
             <p>Elle le regarda. Longuement. Avec une douceur nouvelle. Pas celle d'une prof. Pas celle d'une autorité. Celle d'une femme qui voit la douleur sous la révolte. <em>— « Alors commence par découvrir ce que tu refuses d'être. C'est déjà un début. »</em></p>
             <p>Elle s'éloigna lentement, lui laissant le silence en héritage. Il resta seul dans la salle encore quelques minutes, les yeux rivés sur le paysage enneigé. Le cœur léger. Mais brûlant.</p>`},
            13: { title: "Chapitre 13 – Juste des regards", content: 
             `<p>Depuis la sortie à Kyoto, quelque chose avait changé. Pas dans l'emploi du temps, ni dans les règles. Mais dans l'air. Il se levait plus tôt. Il lisait dans le métro. Il s'asseyait à l'avant de l'amphithéâtre. Pas au premier rang. Mais pas loin.</p>
             <p>Et elle, elle n'évitait plus son regard. Pas de mots inutiles. Juste… de la reconnaissance muette. Un fil invisible qui les reliait.</p>
             <p>Un matin, pendant que les autres bavardaient dans le hall avant le cours, il s'était penché sur un extrait de Kokoro, posé sur ses genoux. Une phrase l'avait marqué : <em>« Il existe un silence que même les mots ne peuvent combler. »</em></p>
             <p>Julie était passée à côté. Elle n'avait rien dit. Mais quand elle avait commencé son cours, elle avait cité ce même passage. Et pendant une fraction de seconde, leurs regards s'étaient accrochés. Un petit vertige. Rien de visible pour les autres. Mais lui, il avait compris : elle savait.</p>
             <p>À la pause, une prof plus âgée, Madame Kirino, avait glissé une remarque à voix basse à Julie. <em>— « Il te regarde comme si tu étais la seule lumière ici. »</em> Julie avait souri. <em>— « Peut-être qu'il cherche simplement à comprendre. »</em> Mais dans ses yeux, un doute s'était allumé.</p>
             <p>Deux jours plus tard. Un vendredi pluvieux. Il était au fond de la bibliothèque. Seul. Il lisait lentement, entouré du silence. Quand deux élèves passèrent près de lui, sans le voir. Ils murmuraient.</p>
             <p><em>— « C'est lui, non ? Celui qui est toujours collé à Kizame-sensei ? »</em> <em>— « Ouais. Tu crois qu'elle le couvre ? Il a jamais été aussi studieux avant… C'est bizarre. »</em> Il ne bougea pas. Mais son sang s'était glacé.</p>
             <p>Le soir, dans la salle des profs, une rumeur circulait. Quelqu'un avait reçu une lettre anonyme. Accusant Julie Kizame d'avoir une "relation inappropriée" avec un étudiant. Pas de preuve. Pas de noms. Mais la graine du doute était plantée.</p>
             <p>Julie, elle, restait droite. Mais seule, en quittant le bâtiment, elle sentit quelque chose de lourd sur ses épaules. Quelque chose qu'elle n'avait pas choisi. Et lui ? Lui sentait que tout ce qu'il avait construit pouvait s'écrouler d'un seul coup. Pas à cause de ce qu'il avait fait. Mais à cause de ce qu'il n'avait pas encore osé faire.</p>` },
            14: { title: "Chapitre 14 – Ligne de feu", content: 
            `<p>La rumeur n'avait pas explosé. Elle s'était répandue doucement, comme un poison. Un murmure glissé à la machine à café. Un regard trop long dans un couloir. Un silence qui pèse dans les réunions.</p>
            <p>Et Julie… Julie sentait tout. Depuis la lettre anonyme, certains collègues étaient devenus froids. D'autres, faussement polis. On ne disait rien ouvertement. On ne posait aucune question directe. Mais elle savait. Et ce silence-là, était pire que mille accusations.</p>
            <p>Elle restait droite. Continua ses cours. Corrigea ses copies. Distribua ses lectures. Mais ses nuits devenaient plus courtes. Et son regard, un peu plus fatigué chaque matin.</p>
            <p>Lui, de son côté, avait remarqué. Et ça le rongeait. Il n'osait pas l'aborder frontalement. Pas encore. Il ne savait même pas s'il avait le droit de lui parler en dehors des cours. Mais il voyait bien ce qui se passait autour d'elle.</p>
            <p>Alors il avait commencé à écouter. Discrètement. Il traînait un peu plus dans les couloirs. Il ralentissait quand il entendait certains groupes murmurer. Un nom revenait. Kenta. Un étudiant jaloux, recalé plusieurs fois, persuadé qu'elle « favorisait les beaux gosses au lieu des bosseurs ».</p>
            <p>Un jour, dans les toilettes du bâtiment C, il surprit une phrase qui le glaça : <em>— « Franchement, Kenta, t'es allé trop loin avec ton truc. »</em> <em>— « Quoi ? Je fais juste circuler la vérité. Si elle n'est pas nette, faut que ça se sache. »</em> Il n'attendit pas la fin de la discussion.</p>
            <p>Ses poings se serrèrent. Il n'était pas un héros. Il ne voulait pas jouer au justicier. Mais là, ça le dépassait.</p>
            <p>Le lendemain, dans la salle de littérature, elle entra comme d'habitude. Mais ses mains tremblaient légèrement en tenant son classeur. Elle le vit au fond de la classe. Plus sérieux que jamais. Il ne disait rien.</p>
            <p>Mais il la regardait comme si elle allait s'effondrer d'un instant à l'autre. Et elle, pour la première fois, le vit vraiment comme un homme. Pas un élève. Pas un perturbateur repenti. Un homme prêt à tout pour la défendre. Même sans qu'elle le sache.</p>
            <p>À la fin du cours, elle rangea lentement ses affaires. Il était resté seul, attendant que les autres sortent. Quand elle releva la tête, il s'approcha. Pas trop près. Mais assez pour qu'elle entende sa voix.</p>
            <p><em>— « Je crois que je sais d'où vient la rumeur. »</em> Elle le fixa. Surprise. Presque bouleversée. <em>— « Tu n'as rien à dire, Nagatoro. Tu ne dois pas t'impliquer. Ce n'est pas ton rôle. »</em></p>
            <p>Il hocha la tête. Mais son regard ne faiblit pas. <em>— « Peut-être. Mais c'est ce que j'ai décidé de faire. Parce que... je veux que vous sachiez que vous n'êtes pas seule. »</em> Un silence. Long. Intense.</p>
            <p>Elle détourna les yeux. Puis, d'une voix douce : <em>— « Sois prudent. Il y a des lignes qu'on ne peut pas franchir. Même pour protéger les autres. »</em> Il baissa légèrement la tête. Mais dans ses yeux brillait une résolution nouvelle.</p>
            <p><em>— « Je sais. Mais certaines lignes méritent d'être brûlées. »</em> Et il sortit, laissant derrière lui un silence plus chaud que d'habitude.</p>` },
            15: { title: "Chapitre 15 – Ceux qui savent et ceux qui croient", content:
             `<p>Le vent s'était levé sur le campus. Un vent sec, nerveux. Comme si la tension des derniers jours s'était glissée dans l'air lui-même. Il n'était pas venu pour se battre.</p>
             <p>Mais quand il vit Kenta, seul sous l'abri du local des vélos, une cigarette aux lèvres et ce sourire arrogant… Il s'approcha. <em>— « C'est toi qui l'as envoyée. La lettre. »</em> <em>— « Quelle lettre ? »</em></p>
             <p>Teddy haussa un sourcil. <em>— « Tu crois que personne t'entend quand tu parles trop fort ? Tu crois que c'est malin de ruiner la vie de quelqu'un parce que t'as pas eu ta petite note de participation ? »</em></p>
             <p>Kenta le dévisagea. <em>— « Oh, le cancre repenti se sent l'âme d'un chevalier maintenant ? T'as cru quoi ? Qu'elle allait tomber dans tes bras ? Qu'elle allait te remercier pour tes jolis yeux ? »</em></p>
             <p><em>— « Je crois que t'as peur. »</em> <em>— « Moi ? De quoi ? »</em> Un silence. Les yeux dans les yeux. Le vent soufflait plus fort.</p>
             <p>Puis Teddy lâcha calmement : <em>— « T'as peur qu'elle t'ait jamais regardé. Pas une seule fois. Même pas comme un élève. »</em> Kenta blêmit. Son poing se crispa.</p>
             <p>Mais Teddy tourna déjà les talons. <em>— « Continue. Un jour ça va se retourner contre toi. Pas par ma main. Mais tu verras. Les lâches finissent toujours seuls. »</em></p>
             <p>Il partit. Le cœur battant. Les dents serrées. Pas de bagarre. Pas besoin. Il avait dit ce qu'il fallait.</p>
             <p>Pendant ce temps, dans la salle des profs, Julie versait de l'eau dans une tasse de thé tiède. Ses doigts tremblaient légèrement.</p>
             <p>Madame Sato, prof d'histoire, l'observait depuis quelques minutes. <em>— « Tu vas bien, Julie ? »</em> Elle releva la tête, sourit doucement. <em>— « Je vais… comme une prof qu'on soupçonne sans preuve. »</em></p>
             <p>Un silence. Puis Sato s'assit à côté d'elle. <em>— « Je ne crois pas un mot de cette rumeur. Tu as toujours été droite. Exigeante. Mais juste. »</em> Julie hésita. Puis murmura : <em>— « Et s'ils avaient raison ? S'il y avait… quelque chose, qui naissait malgré moi ? »</em></p>
             <p>Sato haussa un sourcil, intriguée. <em>— « Tu veux dire… tu ressens quelque chose pour lui ? »</em> Julie ne répondit pas. Elle fixa sa tasse.</p>
             <p>Puis souffla : <em>— « Il est jeune. Troublant. Mais différent. Il s'est métamorphosé en quelques semaines. Et… il me regarde comme personne ne l'a fait depuis longtemps. »</em></p>
             <p>Un long silence. Puis Sato, douce mais directe : <em>— « Alors attention à toi, Julie. Parce que si tu ressens vraiment quelque chose… tu n'as plus affaire à une rumeur. Mais à un choix. »</em></p>
             <p>Julie serra la tasse entre ses mains. Elle comprit, à ce moment-là, que tout était devenu réel.</p>` },
            16: { title: "Chapitre 16 – La peur de ce qu’on ressent", content: `
            <p>Le lendemain, Julie l’évita. Pas brusquement. Mais consciemment. Son regard glissa sur lui en début de cours, sans s’attarder. Elle répondit à ses questions avec froideur. Elle l’ignora presque à la sortie.</p>
<p>Et lui, il comprit. Il sentit cette distance comme une gifle. Mais il n’en dit rien. Elle se protégeait. Et quelque part, il ne pouvait pas lui en vouloir. Il avait vu la peur dans ses yeux, mêlée à autre chose. Quelque chose de dangereux, peut-être même interdit.</p>
<p>Le soir, alors qu’il sortait du bâtiment B, le ciel s’était assombri rapidement. Le vent était plus violent que d’habitude. La pluie tombait en biais. Il se hâta vers l’arrêt de bus quand il vit une silhouette debout, au bord de la route, près du grand portail. Julie.</p>
<p>Elle tenait son téléphone, visiblement en panique. Il s’approcha lentement. <em>— « Sensei ? »</em> Elle sursauta. <em>— « Oh… je ne t’avais pas vu. »</em></p>
<p>Il vit tout de suite qu’elle était agitée. Son parapluie était retourné, ses cheveux trempés, et ses mains tremblaient. <em>— « Vous allez bien ? »</em> <em>— « Mon taxi devait venir… mais j’ai perdu mon sac dans la salle. Et mon téléphone n’a plus de batterie. »</em></p>
<p>Elle riait nerveusement, mais il y avait dans ses yeux une forme de panique silencieuse. <em>— « Attendez ici. Je vais chercher votre sac. »</em> Il partit en courant. Elle voulut protester, mais il était déjà loin.</p>
<p>Cinq minutes plus tard, il revint, trempé, mais tenant le sac contre lui. Elle resta figée, surprise. Et émue. Presque touchée. <em>— « Merci… »</em> Il haussa les épaules. <em>— « Vous auriez fait pareil. »</em></p>
<p>Un silence. Le vent hurlait autour d’eux. <em>— « Tu sais que je t’évite, n’est-ce pas ? »</em> demanda-t-elle doucement. Il la regarda droit dans les yeux. <em>— « Oui. »</em> <em>— « Et tu sais pourquoi. »</em> Il hocha la tête.</p>
<p><em>— « J’ai peur, Nagatoro. Pas de toi. Mais de moi. De ce que je ressens. Et de ce que je risque. »</em> Il ne répondit pas. Juste un regard. Franc. Simple.</p>
<p>Puis, comme un aveu chuchoté dans la tempête : <em>— « Moi aussi. »</em> Elle détourna les yeux, les lèvres entrouvertes. Il n’y eut pas de geste. Pas de contact. Rien de ce qu’un témoin pourrait accuser. Mais un pas avait été franchi. En silence.</p>
            ` },
            17: { title: "Chapitre 17 – Ce que je ne devrais pas ressentir", content: `
            <p>Narré par Julie Kizame</p>
<p>Je n’arrive plus à faire semblant. Les jours passent, les rumeurs murmurent, les regards s’allongent, mais moi… je suis figée. J’ai toujours été droite. Exigeante. Impeccable. Pas parfaite — jamais — mais intègre.</p>
<p>Et maintenant, il suffit qu’il entre dans une pièce pour que mon cœur rate un battement. Je déteste ça. Je le regarde à peine. Je parle moins. Je force mon visage à l’indifférence.</p>
<p>Mais chaque fois qu’il lève les yeux vers moi avec ce mélange d’attention et de silence, je sens que quelque chose gratte sous ma peau, quelque chose de vivant. Un trouble, un appel, une faille.</p>
<p>Je me suis surprise, l’autre soir, à penser à sa voix. Pas ses mots. Sa voix. C’est ridicule. C’est inacceptable. Je suis sa professeure.</p>
<p>J’ai une responsabilité. Une image. Un devoir. Et lui… il est encore trop jeune pour comprendre ce que signifie le poids d’un choix comme celui-là. Ce qu’on perd à vouloir goûter ce qu’on n’a pas le droit de désirer.</p>
<p>Mais il est là. Partout. Discret, maintenant. Sérieux. Mûr, parfois plus que les autres. Et ce soir, quand il a couru sous la pluie pour récupérer mon sac oublié…</p>
<p>J’ai eu peur. Pas de lui. De moi. De ce que j’aurais pu dire si la nuit avait été un peu plus douce. De ce que j'aurais pu faire s'il m'avait regardée un peu plus longtemps.</p>
<p>Je n’ai pas envie de mentir : je ressens quelque chose. Mais je ne veux pas tomber. Pas comme ça.</p>            ` },
            18: { title: "Chapitre 18 – Ce que les autres voient", content: `
            <p>Il y avait ce café discret, à deux pas de l’université, où les professeurs se retrouvaient parfois entre deux corrections. Julie y était installée, seule, un thé noir devant elle, son carnet de notes à moitié ouvert. Elle écrivait par petites touches. Des impressions. Des listes. Des idées de lectures à donner à ses élèves. Mais au fond, elle écrivait pour ne pas penser.</p>
<p><em>— « Julie ? »</em> Elle leva la tête. Un homme s’approchait d’elle, veste beige, lunettes fines. Un air un peu vieilli, mais élégant.</p>
<p><em>— « Hiroshi… »</em> Souffla-t-elle avec un sourire poli. Un ancien collègue. Et un ancien flirt, à une époque où sa vie semblait plus simple.</p>
<p><em>— « Ça fait longtemps ! Je t’ai vue de loin, j’ai hésité… »</em> <em>— « Tu as bien fait. Assieds-toi. »</em> Ils échangèrent quelques banalités. Puis, rapidement, Hiroshi glissa : <em>— « J’ai entendu des choses, tu sais. À propos d’un de tes élèves… »</em></p>
<p>Julie ne répondit pas. Elle remua doucement sa tasse. Il insista, un peu trop curieux : <em>— « Tu es toujours aussi sérieuse, je ne peux pas croire que ce soit vrai. »</em> <em>— « Ce n’est pas vrai »,</em> répondit-elle simplement. Il haussa les épaules, l’air presque déçu.</p>
<p><em>— « Alors c’est juste un élève un peu charmant qui te colle ? Ça arrive, tu sais. »</em> Elle le fixa. Il avait ce ton condescendant qu’elle lui connaissait déjà. <em>— « Ce n’est pas aussi simple. »</em> <em>— « Rien ne l’est, avec toi. »</em></p>
<p>Elle se leva doucement, laissa quelques yens sur la table. <em>— « Bonne journée, Hiroshi. »</em> Et elle partit.</p>
<p>De l’autre côté du campus, il y avait le cours d’économie — une matière que Teddy haïssait cordialement. Il s’y comportait comme un fantôme. Présent physiquement, mais absent dans le regard. Et aujourd’hui, il s’était laissé emporter. Quand le professeur lui avait fait une remarque sur son silence, il avait répondu un peu trop sèchement.</p>
<p>Un mot de travers. Un haussement de sourcil de trop. Et l’incident était lancé.</p>
<p><em>— « Ce garçon est impossible »,</em> grommela le professeur en salle des enseignants, quelques heures plus tard. <em>— « Encore lui ? »</em> répondit un autre. <em>— « Il a l’air calme depuis quelque temps, mais ça reste un instable. Faut qu’on se méfie. »</em></p>
<p>Julie, qui passait au même moment pour déposer un dossier, les entendit. Elle ne dit rien. Mais elle sentit une bouffée de colère. Et une autre, plus étrange encore : de la tristesse. Elle connaissait ce garçon qu’ils jugeaient trop vite. Elle savait ce qu’il essayait de devenir. Et elle se demanda, pour la première fois, si c’était vraiment à elle de reculer.</p>
            ` },
            19: { title: "Chapitre 19 – Une autre époque, une autre erreur", content:  `
            <p>Ce soir-là, Julie était restée tard à l’université. La salle des profs était vide. La pluie tapait doucement contre les vitres, régulière, apaisante. Elle corrigeait des copies à moitié concentrée, jusqu’à ce que ses yeux tombent sur une phrase. Une phrase d’un devoir… signée par Teddy.</p>
<p><em>On ne devient adulte que lorsqu’on accepte d’avoir peur sans fuir.</em> Elle posa son stylo. Ferma les yeux. Et un visage remonta à la surface. Il s’appelait Naoki. Elle avait vingt-trois ans.</p>
<p>Elle n’était pas encore enseignante — elle faisait son stage dans un lycée de Tokyo, pleine d’espoir, pleine d’idéalisme. Naoki était en terminale. Dix-huit ans. Vif, drôle, passionné de poésie. Elle avait vu ce qu’il y avait de beau chez lui.</p>
<p>Et puis il y avait eu un échange de regards trop long. Une main frôlée par accident. Un moment volé dans le couloir, après les cours. Un poème glissé dans un cahier. Rien n’était allé très loin. Mais quelqu’un avait vu. Et ça avait suffi.</p>
<p>Un blâme. Un avertissement. Un mur de silence de la part des autres professeurs. Et surtout, la honte. Celle qui vous colle à la peau, même après des années. Elle avait quitté Tokyo. Changé de ville. Recommencé ailleurs.</p>
<p>Depuis ce jour, elle avait juré de ne plus jamais franchir cette ligne. Mais aujourd’hui, la vie semblait vouloir la mettre à l’épreuve. Encore une fois. La différence, c’est qu’aujourd’hui, ce n’est pas elle qui se trompe.</p>
<p>C’est lui qui grandit, à chaque regard, chaque silence. Et elle… elle ne sait plus si elle doit le freiner ou l’attendre.</p>
            ` },
            20: { title: "Chapitre 20 – Un silence qu’on ne peut fuir",content: `
            <p>Ce fut elle qui demanda à le voir, en dehors des cours. Ils se retrouvèrent près du grand cerisier, derrière le bâtiment administratif. Le vent jouait dans les branches, les pétales tombaient en pluie silencieuse autour d’eux. Elle ne le regarda pas tout de suite. Mais sa voix était claire.</p>
<p><em>— Écoute. Ce qu’il y a entre nous… ce regard, cette tension… Je ne peux pas l’ignorer. Mais je ne peux pas l’accepter non plus.</em> Il baissa la tête. Il s’y attendait. <em>— J’ai un passé que tu ignores. Et des responsabilités que tu n’as pas. Ce n’est pas de l’indifférence. C’est de la retenue.</em></p>
<p>Silence. <em>— Alors si tu ressens quoi que ce soit… je te demande de le taire.</em> Il ne répondit pas. Mais son regard trahissait ce mélange étrange de compréhension et de frustration. Elle crut même y lire… du respect. Et elle partit sans se retourner.</p>
<p>Deux jours plus tard, un voyage d’étude fut organisé par le département de littérature. Un petit groupe d’étudiants, accompagnés de deux professeurs, devait se rendre dans une auberge traditionnelle à Nikkō pour deux jours de lectures et d’ateliers en immersion. Elle n’avait pas vu son nom sur la liste. Et pourtant… il était là. Assis au fond du car, carnet à la main. Discret. Silencieux. Elle fit semblant de ne pas être troublée.</p>
<p>Arrivés à l’auberge, la pluie s’était mise à tomber fort. Un imprévu dans les réservations avait forcé une réorganisation de dernière minute : plus de chambres disponibles pour les professeurs séparément. Le directeur du voyage s’excusa à plat : <em>— Je suis désolé, Julie-sensei… La seule chambre restante est une grande pièce partagée avec un paravent. Vous serez obligée de dormir dans la même salle que Nagatoro-kun. Mais bien sûr, tout sera fait avec décence.</em></p>
<p>Elle voulut protester. Chercher une solution. Mais il était déjà tard, la pluie battait, et la voiture qui devait amener les autres chambres n’arriverait que le lendemain. Elle croisa brièvement son regard. Il n’avait rien dit. Il n’avait même pas souri. Juste ce regard grave, et calme.</p>
<p>Le soir, la pièce était simple. Tatamis au sol. Un paravent en bois séparait la pièce en deux moitiés. Elle resta longtemps assise sur son côté, le carnet ouvert devant elle, incapable d’écrire. Il ne faisait aucun bruit. Et dans ce silence, ce vrai silence, elle sentit quelque chose d’autre monter. Pas du désir. Pas encore. Mais l’évidence d’un lien qu’aucune règle ne pourrait effacer.</p>   ` },
            21: { title: "Chapitre 21 – Ce qu’on tait trop longtemps", content: `
            <p>La pluie avait cessé, mais l’humidité rendait l’air lourd. De l’autre côté du paravent, il n’y avait que du silence. Ni musique, ni lumière, ni voix. Rien. Julie se tenait assise, dos au mur, jambes repliées contre elle. Elle sentait le battement de son cœur jusque dans ses poignets.</p>
<p>Elle n’avait jamais été aussi proche de lui, physiquement, et pourtant… un monde semblait les séparer. Elle ferma les yeux. Ne pense pas. Ne ressens pas. Dors. Mais le sommeil ne venait pas.</p>
<p>Et c’est là qu’un bruit sec retentit. Une voix jeune, puis une autre, plus agressive. Un éclat de dispute, à l’extérieur, dans le couloir de l’auberge. Julie se leva immédiatement, ouvrit la porte coulissante. Deux étudiants s’invectivaient. L’un d’eux avait visiblement bu en cachette. L’autre essayait de le calmer. Elle reconnut l’un des élèves de sa classe.</p>
<p><em>— Ce n'est pas ton rôle de me faire la morale !</em> criait-il, titubant. <em>— Ce n’est pas la question ! Tu vas tout gâcher, abruti !</em> Elle intervint, voix ferme : <em>— Ça suffit. Rentrez immédiatement. Je signalerai ça demain matin.</em> Ils obéirent, à contre-cœur.</p>
<p>Quand elle revint dans la chambre, il était là, debout, visiblement prêt à intervenir aussi. Le paravent ne les séparait plus. Elle s’arrêta net. Il la regarda. Pas un mot déplacé. Juste… une inquiétude réelle.</p>
<p><em>— Je croyais que tu dormais…</em> dit-elle, presque gênée. <em>— Je t’ai entendue sortir. Je voulais juste… être prêt.</em> Elle hocha la tête. Et puis, sans réfléchir, elle s’assit à nouveau, cette fois du même côté.</p>
<p>Quelques secondes passèrent. Puis sa voix, basse : <em>— Tu ne m’as pas demandé pourquoi je t’ai demandé de ne plus rien montrer.</em> Il la regarda, surpris. <em>— Je me suis dit que c’était parce que tu voulais me protéger… Ou t’éviter des problèmes.</em></p>
<p><em>— Ce n’est pas que ça.</em> Elle hésita. <em>— Il y a longtemps… j’ai fait une erreur. Une vraie. Et j’ai eu peur que l’histoire se répète.</em> Il resta silencieux. Mais son regard avait changé. Il n’était plus celui d’un élève.</p>
<p><em>— Je ne suis pas l’autre personne qui vous a fait souffrir,</em> murmura-t-il. Elle le fixa. Il avait compris. <em>— Et je ne suis pas la même non plus,</em> répondit-elle enfin. Le silence reprit, mais plus doux. Plus dense.</p>
<p>Quand elle se leva pour regagner sa moitié de chambre, elle avait les mains qui tremblaient. Pas de peur cette fois. Mais de conscience : quelque chose venait de basculer.</p>
            ` },
            22: { title: "Chapitre 22 – La pente glissante", content: `
            <p>Le retour à l’université approchait. Les sacs étaient prêts, les étudiants riaient en remontant dans le car. L’auberge, derrière eux, semblait n’avoir été qu’une parenthèse. Mais ce matin-là, elle avait proposé une dernière activité : une promenade silencieuse, chacun muni d’un carnet, dans les sentiers boisés qui bordaient les lieux. S’imprégner du réel avant de le réécrire. Voilà comment elle l’avait justifié.</p>
<p>Lui, bien sûr, avait suivi. Mais à distance. Respectueux. Silencieux. Présent. Julie sentait sa présence sans la voir. Et pourtant… elle aurait juré entendre son souffle derrière elle, à chaque tournant du sentier. La pente devint plus raide. Le sol, encore trempé par la pluie de la veille, était glissant.</p>
<p>Elle s’accroupit un instant pour noter quelque chose dans son carnet — un haïku, peut-être, ou un fragment de pensée. Et c’est là qu’elle glissa. Le choc fut bref, mais sec. Elle dévala sur quelques mètres, sa cheville cognant contre une racine. Elle poussa un petit cri, plus de surprise que de douleur. Mais en quelques secondes, il était là. Haletant.</p>
<p><em>— Sensei !</em> Il s’agenouilla près d’elle. Elle tentait déjà de se relever, mais une grimace lui échappa. <em>— Ça va. Ce n’est rien.</em> <em>— Laisse-moi voir.</em> Il toucha sa cheville avec douceur, mais ses mains tremblaient. Il était pâle. Terrifié. <em>— Ce n’est pas cassé,</em> murmura-t-elle, essayant de garder le contrôle. <em>— Tu peux marcher ?</em> Elle essaya de se lever. Son genou céda légèrement. Il passa son bras derrière son dos, un peu trop naturellement.</p>
<p><em>— Je vais t’aider.</em> Elle voulut refuser. Dire qu’elle allait appeler un collègue. Trouver un prétexte. Mais ses mots restèrent coincés. Car au fond, elle savait qu’elle n’avait pas envie de le repousser.</p>
<p>Ils avancèrent lentement, elle appuyée contre lui. Le contact de son épaule la troubla plus que de raison. Il ne disait rien. Il la soutenait, simplement. Au détour d’un virage, alors qu’ils voyaient déjà le toit de l’auberge au loin, elle souffla : <em>— Tu me rends vulnérable.</em></p>
<p>Il la regarda. Ses yeux ne cherchaient plus à séduire. Ils comprenaient. Ils respectaient. <em>— Tu me rends meilleur,</em> répondit-il simplement. Elle baissa les yeux. Pour la première fois, elle ne savait plus si elle devait fuir... ou rester là, encore un peu.</p>
            ` },
            23: { title: "Chapitre 23 – Le retour et les murmures", content: `
            <p>Le car avait déposé les étudiants devant le campus sous un ciel gris, presque symbolique. Chacun rejoignait son dortoir, son train, ou disparaissait en riant dans les allées. Elle descendit la dernière. Lui aussi. Aucun mot n’avait été échangé depuis la veille. Aucun contact. Juste ce dernier regard, pendant qu’il l’aidait à grimper les marches du car, et ce silence trop chargé durant tout le trajet.</p>
<p>Le lundi suivant, les cours reprirent. Et avec eux, les regards. Au début, ce n’était rien. Une remarque anodine d’un collègue : <em>— Tu avais l’air épuisée, Julie. Ce voyage t’a demandé plus que prévu ?</em> Puis un élève qui ricanait en regardant dans sa direction. Un autre qui chuchotait un prénom. Pas le sien.</p>
<p>Elle fit semblant de ne rien voir. Mais elle savait. Quelqu’un avait vu la scène dans la forêt. Ou du moins, avait imaginé le reste.</p>
<p>De son côté, il faisait tout pour ne pas croiser son regard. En cours, il s’asseyait au fond. Il prenait des notes. Sérieusement. Mais elle sentait son trouble, son effort pour paraître détaché. Et quelque chose en elle se tordait. Elle voulait le remercier, le rassurer, l’éloigner, le retenir tout en même temps.</p>
<p>Le jeudi, à la pause, elle le surprit dans la cour, seul sur un banc, les yeux levés vers les branches d’un arbre encore nu. Elle s’approcha. Lentement. <em>— Tu arrives à rester discret…</em> Il sourit faiblement. <em>— Je me suis dit que c’était mieux.</em></p>
<p><em>— Tu crois ?</em> Elle s’assit à côté de lui. Loin. Mais pas trop. <em>— Je ne veux pas te nuire,</em> dit-il enfin. Elle tourna la tête. <em>— Et si c’était moi qui te nuisais ?</em></p>
<p>Un silence. Il serra les dents. <em>— Tu sais, parfois j’ai l’impression que si j’avais été un peu plus bête, ou un peu plus lâche, tout aurait été plus simple.</em> <em>— Et tu regrettes de ne pas l’être ?</em> Il rit, sans joie. <em>— Je regrette que le monde ne soit pas fait pour ça. Pour ce qu’on vit.</em></p>
<p>Elle ne répondit pas. Mais au fond, elle savait qu’ils venaient de franchir une autre ligne : Celle de la complicité, plus profonde encore que le désir.</p>
            ` },
            24: { title: "Chapitre 24 – La nuit trouble", content: `
            <p>Julie n’était pas rentrée à la maison car elle avait une tâche à faire tôt le matin. Elle était restée à l’école. Il était près de deux heures du matin. Le campus dormait. Le silence avait quelque chose d’inquiétant, presque pesant. Julie tournait dans son petit appartement, situé juste à côté du bâtiment des professeurs. Les feuilles de copies s’étalaient devant elle, intactes. Le stylo roulait entre ses doigts. Impossible de se concentrer.</p>
<p>Depuis leur conversation sur le banc, elle n’avait plus de repère intérieur. Ce n’était plus une simple attirance. Ce n’était plus juste une histoire d’élève et de professeur. C’était lui, avec ses silences, ses failles, ses efforts. Et c’était elle, qui voulait résister, mais cherchait inconsciemment ses présences, ses gestes, ses regards.</p>
<p>Elle ouvrit son téléphone. L’écran blanc l’éblouit un instant. Son doigt glissa sans réfléchir. Elle n’avait jamais enregistré son numéro. Mais elle l’avait mémorisé. Elle hésita longuement. Puis elle tapa : <em>Tu dors ?</em> Envoyé. Elle détesta aussitôt ce message. Trop direct. Trop lâche. Trop… vrai. Elle posa le téléphone et se détourna.</p>
<p>Mais l’écran vibra trente secondes plus tard. <em>Non.</em> Une hésitation. Puis un second message : <em>Tu veux que je vienne ?</em> Son cœur s’arrêta. Tout aurait dû la pousser à répondre non. À ne rien dire. À laisser ça mourir dans la nuit. Mais elle écrivit : <em>Viens, je suis en ce moment dans l’appartement de l’école.</em></p>
<p>Il arriva quinze minutes plus tard. Pas un mot en entrant. Elle portait un sweat trop grand. Pas maquillée. Les cheveux relevés sans soin. Il s’assit. Loin d’elle. Respectueux. Comme toujours. Mais l’ambiance était différente. Il n’y avait plus de barrière, plus de rôle à jouer.</p>
<p><em>— Tu vas me le reprocher demain,</em> murmura-t-il. Elle secoua la tête. <em>— Non. Parce que ce soir, j’avais besoin que quelqu’un… soit là. Juste là.</em> Il baissa les yeux. <em>— Je suis fatiguée de lutter.</em></p>
<p>Elle se leva. Avança lentement. S’assit à côté de lui. Le silence les enveloppa. Un silence calme. Vivant. Et dans ce silence, elle posa simplement sa tête contre son épaule. Pas d’embrassade. Pas de geste déplacé. Juste ça. Le droit d’exister à côté de l’autre.</p>            ` },
            25: { title: "Chapitre 25 – Ce que la nuit a laissé", content: `
            <p>Le soleil était timide ce matin-là. Il passait à peine entre les rideaux tirés, découpant des lignes pâles sur le sol. Elle ouvrit les yeux. Il était toujours là. Assis dans le fauteuil près de la fenêtre, les bras croisés, la tête penchée sur le côté. Il n’avait pas dormi. Ou s’il l’avait fait, ce n’était que par fragments.</p>
<p>Julie resta allongée un moment, sans bouger. Le cœur battant, mais calme. Presque trop calme. Elle se redressa doucement. Il ouvrit les yeux. Leurs regards se croisèrent. Aucun mot. Elle aurait voulu dire : « Merci. » Ou même : « Tu peux partir maintenant. » Mais rien ne sortit.</p>
<p>Finalement, il se leva. En silence. S’approcha de la porte. Puis il s’arrêta. <em>— Je n’ai rien attendu de cette nuit. Je ne veux pas te faire peur.</em> Elle répondit, sans le regarder : <em>— Tu ne me fais pas peur. Tu me fais… exister.</em> Il hocha lentement la tête, ouvrit la porte, et sortit.</p>
<p>Trois jours passèrent. Elle corrigea des copies. Il assista à tous ses cours. Ils s’évitèrent soigneusement. Mais à chaque fois qu’elle parlait, elle sentait ses yeux sur elle. Et à chaque fois qu’il répondait en classe, il cherchait inconsciemment l’ombre d’un sourire, même discret, même interdit.</p>
<p>Les rumeurs, elles, s’étaient calmées. Le monde extérieur avait repris son cours. Mais en eux, quelque chose avait bougé. Elle revivait sans cesse ce moment où elle s’était laissée aller à poser sa tête contre lui. Lui, cette nuit où il avait veillé sur elle sans rien demander, sans rien prendre.</p>
<p>Le vendredi, à la sortie du bâtiment, elle le croisa par hasard dans un couloir vide. Il s’arrêta. Elle aussi. <em>— Tu vas bien ?</em> demanda-t-il, hésitant. Elle acquiesça. Puis, soudainement : <em>— Et toi ? Tu tiens le coup ?</em> Un sourire faible étira ses lèvres. <em>— Je dors peu. Mais je me tiens.</em></p>
<p>Un silence. <em>— Moi aussi,</em> murmura-t-elle. Puis elle s’éloigna, rapidement. Trop rapidement. Mais lui, cette fois, n’avait pas besoin de plus. Il savait qu’ils étaient deux à porter ce silence, deux à ne pas vouloir y renoncer.</p>
            ` },
            26: { title: "Chapitre 26 – L’étau", content: `
            <p>La semaine suivante s’était déroulée comme en apnée. Les regards avaient cessé, les soupçons s’étaient tus, mais l’atmosphère restait électrique. Il suivait ses cours avec un sérieux impressionnant. Elle, plus rigide que jamais, évitait toute proximité. Mais au fond d’eux… Chaque mot échangé, chaque silence gardé, était un cri contenu.</p>
<p>Ce mercredi, après son dernier cours, elle restait dans sa salle pour corriger quelques textes d’étudiants. La pièce était calme. Trop calme. La porte s’ouvrit brusquement. Un collègue entra, un air faussement détendu sur le visage. <em>— Salut Julie ! Tu as cinq minutes ?</em> Elle referma rapidement son carnet. <em>— Bien sûr, entre.</em></p>
<p>Il regarda autour de lui, puis posa un dossier sur le bureau. <em>— Rien d’urgent. Juste une petite chose dont je voulais te parler… discrètement.</em> Son ton était trop léger pour être sincère. <em>— Il paraît que tu aurais eu un comportement… disons, trop proche avec un étudiant durant le voyage.</em></p>
<p>Elle le fixa. Le cœur bloqué. <em>— Rien de concret, bien sûr. Juste des bruits. Des petits commentaires remontés par d’autres profs.</em> Elle ne répondit pas. Trop bien entraînée à garder la face. Il poursuivit, baissant la voix : <em>— Je te fais confiance. Mais fais attention. Tu sais à quel point ce genre de choses peut aller vite.</em> Il sourit faussement, comme s’il venait de lui offrir un conseil amical. Puis il repartit, la laissant seule, raide, les mains crispées sur les bords du bureau.</p>
<p>Elle ne rentra pas chez elle ce soir-là. Elle marcha, longtemps, dans les rues presque vides autour du campus. Puis elle prit une décision.</p>
<p>Il lisait dans sa chambre, assis sur son lit, quand on frappa doucement à la porte. Il ouvrit, surpris. Elle était là. Sans sac. Sans veste. Les traits tirés. Mais le regard clair. <em>— Je peux entrer ?</em> Il se poussa.</p>
<p>Elle resta debout au milieu de la pièce, un long moment. Puis elle parla. D’une voix posée, presque calme. <em>— On m’a interrogée aujourd’hui. Officiellement, c’est rien. Juste des soupçons.</em> Il pâlit. Elle continua : <em>— On est en train de se mettre en danger, toi et moi. Et ce n’est pas par imprudence. C’est parce qu’on refuse de nommer ce qu’on ressent.</em></p>
<p>Elle le regarda droit dans les yeux. <em>— Alors je te pose la question. Une seule. Et je veux que tu répondes sans détour.</em> Il hocha lentement la tête. Elle inspira. <em>— Est-ce que tu m’aimes ?</em> Un silence. Puis il murmura : <em>— Oui. Mais pas comme un étudiant aime sa prof. Comme un homme aime une femme. Même si je n’ai pas encore tout vécu, même si je suis loin d’être prêt… je sais que ce que je ressens, c’est réel.</em></p>
<p>Elle ferma les yeux. Une larme coula. Puis elle dit : <em>— Alors aide-moi à ne pas fuir. À faire les choses bien. Ou à tout arrêter. Mais ne me laisse pas rester dans ce milieu flou.</em></p> ` },
            27: { title: "Chapitre 27 – Le seuil", content: `
            <p>Les jours suivants furent une tempête silencieuse. Ils avaient mis des mots sur ce qu’ils ressentaient. Et depuis, chaque regard était plus lourd. Chaque absence, plus vive. Chaque geste, plus risqué. Ils tentaient de faire comme si rien n’avait changé. Mais tout avait changé.</p>
            <p>Un soir, alors que le campus était désert à cause d’un week-end prolongé, la bibliothèque restait ouverte en nocturne. Il y était. Elle aussi. Par hasard. Ou peut-être pas. Il se tenait dans un recoin de la salle de lecture, un livre de littérature moderne à la main. Elle passa dans l’allée, s’arrêta. Le vit. Leurs yeux se croisèrent.</p>
            <p>Elle hésita, puis avança doucement. <em>— Tu lis vraiment ça, ou tu fais semblant ?</em> Un sourire en coin, mais un battement rapide sous sa poitrine. <em>— J’essaie,</em> dit-il. <em>Mais je ne comprends rien quand t’es là.</em> Elle détourna les yeux, gênée. Mais ne recula pas.</p>
            <p>Le silence s’installa. Elle fit un pas. Puis un autre. Il referma le livre. Se leva. Leurs souffles étaient courts. L’espace se resserrait. Et sans qu’aucun mot ne soit prononcé, sans qu’aucune décision n’ait l’air d’être prise, le moment bascula.</p>
            <p>Elle avança, guidée par quelque chose de plus fort qu’elle. Il tendit la main, comme pour vérifier qu’elle était bien réelle. Leurs lèvres se trouvèrent. D’abord lentement. Puis plus fort. Plus profond. Tout ce qu’ils avaient contenu explosa en silence.</p>
            <p>La peur. Le doute. La retenue. Il la serra contre lui, comme s’il avait attendu ce moment depuis des siècles. Elle répondit avec la même urgence. Plus de hiérarchie. Plus de rôles. Juste eux. Deux âmes en déséquilibre, qui se reconnaissaient enfin.</p>
            <p>Ils restèrent longtemps dans ce coin reculé, à se murmurer des choses sans importance, à se toucher le visage comme pour s’assurer que c’était vrai. Quand elle se leva enfin pour partir, elle glissa simplement : <em>— Ce qu’on vient de faire… c’est le début ou la fin. Mais plus jamais l’entre-deux.</em> Il acquiesça. <em>— J’accepte de tomber. Tant que c’est avec toi.</em></p> ` },
            28: { title: "Chapitre 28 – Loin des regards",content:  `
            <p>C’était un mardi après-midi. Il n’y avait pas cours. Le ciel était clair. L’air doux. Le printemps commençait à recouvrir la ville d’une lumière tendre. Elle lui avait envoyé un simple message : <em>15h. Temple de Kiyomizu. Discret.</em></p>
<p>Il avait couru. Pas pour être à l’heure. Mais parce que chaque minute passée loin d’elle lui semblait incomplète, désormais. Le temple était presque vide à cette heure-là. Quelques touristes. Des moines silencieux. Le bruit léger du vent dans les arbres. Elle était là, près d’un cerisier encore timide, vêtue simplement. Lunettes. Chapeau. Pas de maquillage.</p>
<p>Quand il arriva, elle sourit à peine. Mais il lut dans ses yeux tout ce qu’elle n’osait pas montrer en public. Ils marchèrent longtemps. Sans se toucher. Mais chaque geste, chaque regard était une caresse invisible. Elle lui montra un petit chemin secret derrière les murs. Ils s’assirent sur une pierre, à l’abri de tout.</p>
<p>Et là, elle se tourna vers lui. Enfin. <em>— Tu sais… quand je t’ai vu pour la première fois, je t’ai trouvé ingérable. Arrogant. Trop sûr de toi.</em> Il sourit. <em>— Et maintenant ?</em> <em>— Maintenant, j’ai peur. Parce que tu es en train de devenir quelqu’un de meilleur. Et c’est moi qui t’ai vu changer.</em></p>
<p>Un silence. Il murmura : <em>— Je n’ai pas changé pour toi. J’ai juste… trouvé une raison de devenir ce que j’aurais toujours dû être.</em> Elle le regarda. Longuement. Puis, dans un souffle : <em>— Embrasse-moi.</em> Il obéit. Lentement. Comme si le monde pouvait s’effondrer autour, et qu’ils n’auraient besoin de rien d’autre.</p>
<p>Ils restèrent là, longtemps, à parler de tout et de rien. Du cours de littérature. De ses notes. De ses rêves. De son envie d’écrire, un jour, peut-être. Et elle, pour la première fois, lui raconta sa propre jeunesse. Ses hésitations. Ses blessures. Plus de masques. Juste deux êtres à nu, dans un après-midi volé au reste.</p>
<p>Quand ils se séparèrent, ce fut sans tristesse. Car ils savaient que quelque chose venait de naître — non plus dans le secret ou l’interdit, mais dans une vérité douce et profonde.</p>` },
            29: { title: "Chapitre 29 – Ce que le monde réclame",content: `
            <p>Trois jours après leur rendez-vous au temple, tout semblait reprendre son cours. Elle était prof. Il était étudiant. Et entre eux : rien. Du moins en apparence. Mais derrière les regards contrôlés, le cœur battait à chaque instant où leurs mains frôlaient la même feuille. Chaque mot prononcé en classe devenait double. Tout était secret. Et pourtant plus réel que jamais.</p>
<p>Ce vendredi matin, en salle des profs, Julie buvait son café lorsqu’un courrier interne attira son attention. Demande de convocation : Mlle Julie Kizame – à propos du comportement d’un élève (T. N.) Son cœur se serra. Elle n’en montra rien. Mais son souffle se coupa un instant. Une ligne en bas, presque banale : Présence du doyen requise.</p>
<p>De son côté, il n’avait encore rien vu venir. Mais dès le lendemain, les murmures recommencèrent. Un élève de sa classe, Hiroshi, le fixait plus souvent. Une autre, Yuna, lui avait lancé, à demi-mots : <em>— C’est marrant comme tu t’es calmé d’un coup… On dirait que quelqu’un te tient en laisse.</em> Il avait ravalé sa réponse. Mais au fond, il le savait : le vernis craquait.</p>
<p>Et pire encore : un doute naquit en lui-même. Si leur relation éclatait… Est-ce qu’elle le protégerait ? Ou est-ce qu’elle le laisserait porter seul le poids de ce qu’ils avaient construit à deux ?</p>
<p>Ils se retrouvèrent le soir même, dans une petite rue près du quartier de Gion, comme convenu. Elle était tendue. Lui aussi. Mais à peine arrivé, il lança : <em>— Tu savais pour la convocation ?</em> Elle se figea. Il lisait dans ses yeux que oui. <em>— Pourquoi tu ne m’as rien dit ?</em> <em>— Parce que je ne voulais pas t’affoler.</em> <em>— Ce n’est pas moi qui suis en danger, Julie. C’est toi. Tu risques ta carrière. Ton avenir.</em></p>
<p>Elle soupira. Une larme lui monta presque aux yeux, mais elle la retint. <em>— Et toi, tu crois que je le fais à la légère ? Tu crois que c’est un jeu ?</em> Le silence tomba. Puis il murmura : <em>— Je t’aime. Mais parfois j’ai l’impression que t’as plus peur pour ta réputation que pour… nous.</em></p>
<p>Cette fois, elle ne retint pas sa voix qui trembla : <em>— Et moi, j’ai l’impression que tu n’as pas encore mesuré ce que ça coûte d’aimer dans l’ombre !</em> Ils restèrent face à face. Tiraillés entre l’amour immense qu’ils se portaient… Et la peur sourde de ce que le monde allait leur faire payer.</p>
<p>Ce soir-là, ils ne s’embrassèrent pas. Ils se quittèrent sans bruit. Mais chacun, de son côté, savait : le choix approchait. Et ce ne serait pas un choix facile.</p>` },
            30: { title: "Chapitre 30 – Devant le mur", content: `
            <p>Le bureau du doyen était silencieux, presque trop propre. Tout y respirait la rigueur, l’ordre… et la froideur. Julie entra, droite, le dos tendu. Elle portait une blouse sobre, les cheveux attachés. Pas un mot de trop. Pas un geste qui trahit le trouble. Assis derrière son large bureau, le doyen leva à peine les yeux. <em>— Mademoiselle Kizame, prenez place.</em></p>
            <p>À sa droite, deux autres personnes étaient présentes : Une conseillère pédagogique et un membre du comité éthique de l’université. Elle s’assit, les mains croisées sur les genoux. <em>— Vous savez pourquoi vous êtes ici, n’est-ce pas ?</em> <em>— On m’a parlé d’un signalement.</em></p>
            <p><em>— En effet. Plusieurs remarques nous sont remontées. D’abord sur l’attitude de l’élève… Nagatoro. Puis, plus récemment, sur vos absences coïncidentes. Vos échanges en dehors des heures. Et certaines observations douteuses faites par vos collègues.</em> Elle serra discrètement la mâchoire. <em>— Ai-je enfreint une règle précise ?</em></p>
            <p><em>— Pas encore. Mais nous devons vous poser une question directe. Et nous attendons une réponse claire.</em> Un silence. Une attente. Puis la conseillère éducative parla, plus douce : <em>— Avez-vous eu, ou entretenez-vous actuellement, une relation autre qu’académique avec cet étudiant ?</em></p>
            <p>Julie sentit son cœur cogner dans sa poitrine. Pas de mensonge possible. Pas de fuite non plus. Mais une nuance. Un combat. Elle inspira. Et répondit lentement : <em>— Je n’ai jamais favorisé cet étudiant. Je n’ai jamais brisé les règles pendant mes heures de cours, ni porté atteinte à ma fonction. Mais…</em> Elle marqua une pause. Puis regarda droit devant elle : <em>— Ce garçon, que tout le monde a jugé sans le comprendre, a changé. Il a appris. Travaillé. Il m’a surprise. Ému.</em> Un léger tremblement dans sa voix : <em>— Et oui… je ressens quelque chose pour lui.</em></p>
            <p>Un silence glacial s’abattit dans la pièce. Le doyen fronça les sourcils. <em>— Ce n’est pas une réponse qu’on peut accepter à la légère.</em> Julie redressa le menton : <em>— Je suis prête à répondre de mes actes. Mais pas à avoir honte d’un lien sincère.</em></p>
            <p>Le reste de l’entretien fut plus administratif. Ils parlèrent de procédures. D’éthique. De responsabilité. Mais dans l’air… La décision planait déjà.</p>
            <p>En sortant du bureau, elle marcha jusqu’au bout du couloir, seule. Puis s’arrêta près d’une fenêtre. Le campus semblait calme dehors. Mais en elle, tout était bouleversé. Elle sortit son téléphone. Et lui envoya un seul message : <em>On m’a entendue. On ne pourra plus revenir en arrière.</em></p> ` },
            31: { title: "Chapitre 31 – L’évidence", content:`
            <p>Il reçut le message en plein milieu de la soirée. <em>On m’a entendue. On ne pourra plus revenir en arrière.</em> Il resta figé, téléphone en main, les battements de son cœur se déchaînant. Pas de simley. Pas de détour. Juste cette vérité nue. Il comprit. Tout ce qu’ils avaient évité jusque-là venait de tomber sur eux.</p>
<p>Et elle… avait parlé. Il sentit une vague de peur monter. Mais sous cette peur, quelque chose d’encore plus fort : Le besoin de la voir. Maintenant. Il traversa la ville à pied. Vite. Le cœur tambourinant. Pas de bus. Pas de métro. Il ne voulait pas réfléchir. Juste marcher vers elle.</p>
<p>Elle l’attendait, comme d’instinct, sous le vieux pont derrière le campus. Là où personne n’allait. Là où le monde semblait s’éloigner. Quand elle le vit, elle ne bougea pas. Pas besoin. Il arriva essoufflé, les yeux pleins d’inquiétude. <em>— Qu’est-ce qu’ils vont faire ? Tu vas perdre ton poste ?</em></p>
<p>Elle haussa les épaules, fatiguée, mais droite. <em>— Peut-être. Ils m’ont dit qu’ils allaient réfléchir. Et que je serais tenue à l’écart pendant un temps.</em> Il baissa les yeux, les poings serrés. <em>— Tout ça… c’est à cause de moi.</em> Elle s’approcha, posa sa main sur sa joue. <em>— Non. C’est à cause de ce qu’on ressent. Et de ce que ça dérange.</em></p>
<p>Un silence. Puis il releva les yeux : <em>— On peut tout arrêter. Si tu veux.</em> Elle le regarda longuement. Ses yeux tremblaient. Mais pas sa voix : <em>— Est-ce que tu peux vraiment imaginer ta vie sans moi ?</em> Il déglutit. L’émotion le saisissait à la gorge. <em>— Non…</em> <em>— Moi non plus.</em></p>
<p>Alors elle tendit la main. Et il la prit. <em>— Quoi qu’ils fassent, quoi qu’ils disent, on reste ensemble. Tu es prêt à se battre pour ça ?</em> <em>— Même si ça veut dire être rejeté, critiqué, mis à l’écart ?</em> <em>— Même si ça veut dire devenir un homme. Un vrai.</em> Un frisson le traversa. Mais cette fois, ce n’était plus de peur. C’était de détermination.</p>
<p>Il l’attira contre lui. Fort. Elle enfouit son visage dans son cou, comme pour se protéger de tout le reste. Ils restèrent là, longtemps, sans parler. Juste deux cœurs battant à l’unisson, contre le reste du monde.</p>
<p>À la fin, elle murmura : <em>— On n’est peut-être pas dans la norme. Ni dans les règles. Mais on est dans la vérité. Et c’est tout ce qui compte.</em> Il hocha la tête, le regard fixe. Et dans cette nuit suspendue, ils firent le serment silencieux de ne plus reculer.</p>` }, 
            32: { title: "Chapitre 32 – Entre ombres et lumière", content: `
            <p>Les jours qui suivirent furent comme un tourbillon sans fin. À la fac, les murmures ne cessèrent de croître. Des regards lourds de jugements, des chuchotements à voix basse. Même certains professeurs, réunis en secret, parlaient d’elle et de lui comme d’un scandale à étouffer. Leurs noms circulaient dans les couloirs, teintés d’un mélange de curiosité et de mépris.</p>
            <p>La réputation de Julie était désormais entachée. Pour l’étudiant, les moqueries allaient crescendo, et ses camarades commençaient à l’éviter. À la maison, la nouvelle fit vaciller la famille. Sa mère, dévastée, pleura longtemps, incapable d’accepter ce qu’elle jugeait une faute grave. Son père, froid et autoritaire, lui reprocha son « immaturité » et son « manque de respect pour la tradition ». Pourtant, au milieu des reproches, une lueur d’inquiétude sincère brillait parfois dans leurs yeux.</p>
            <p>Julie, elle, reçut la sanction officielle : une suspension immédiate, sans date claire de retour. Une décision brutale, prise pour « préserver l’image » de l’université. Elle se retrouva soudain coupée de ce qu’elle aimait le plus — enseigner et être proche de ses élèves.</p>
            <p>Pourtant, malgré l’orage, ils s’accrochaient à leur lumière. Ils se retrouvaient en secret, à l’abri des regards indiscrets. Dans ce petit café discret près du parc, sous le vieux pont où tout avait commencé, ou simplement dans un coin tranquille de la bibliothèque. Chaque instant volé était une victoire sur le silence et la peur.</p>
            <p><em>On doit montrer qu’on est plus forts que leurs jugements,</em> souffla-t-elle un soir en serrant sa main. Il acquiesça, le regard brûlant de détermination. <em>— Oui. Mais comment ? Comment convaincre tous ces gens que notre amour n’est pas une erreur, mais une vérité ?</em> Ils savaient que leur combat ne faisait que commencer.</p>` },
            33: { title: "Chapitre 33 – Le combat commence", content: `
            <p>Dans ce petit café, à l’abri des regards, Julie et lui se regardaient droit dans les yeux, déterminés. <em>Il faut qu’on parle au doyen. Je ne peux pas rester suspendue sans explications. Et surtout pas comme ça, dans le silence.</em> <em>Je suis prêt. Je veux lui montrer que je ne suis plus ce gamin rebelle. Que cette relation n’a pas détruit ma vie, au contraire.</em></p>
<p><em>Tu as changé. Ce n’est plus un secret. Mais eux, ils ne veulent pas voir ça. Ils voient juste une prof qui a dépassé les limites.</em> <em>Alors on va leur montrer autre chose. Leur prouver que ce qu’on a, c’est sérieux. Que ça nous fait grandir.</em></p>
<p><em>Je veux préparer un discours. Pas trop long, sincère. Je vais expliquer ce que cette histoire signifie pour moi. Pourquoi je refuse de la cacher.</em> <em>Moi, je parlerai aussi. Je raconterai comment ça m’a poussé à devenir meilleur. Que ce n’est pas une histoire d’interdit, mais de respect.</em></p>
<p><em>On aura besoin d’alliés. Des professeurs qui me connaissent vraiment, qui ont vu mon travail et mon intégrité.</em> <em>Et des étudiants aussi. Ceux qui ont vu que je changeais, pas seulement à cause de toi, mais pour moi.</em></p>
<p><em>Ça va être dur. Mais si on reste soudés, on peut y arriver.</em> <em>On est prêts à se battre. Pour notre amour, pour notre avenir.</em> Ils se prirent la main, un pacte silencieux entre eux. <em>Alors, demain, on commence. Ensemble.</em></p>` },
            34: { title: "Chapitre 34 – Devant le doyen", content: `
            <p>La salle du doyen était silencieuse. Sombre. Froide. La grande horloge accrochée au mur semblait ralentir chaque seconde. Julie s’assit la première, droite mais nerveuse. Lui, juste à côté, plus tendu encore, fixait le dossier en bois du bureau. Face à eux, le doyen Igarashi feuilletait un dossier, silencieux, sans même lever les yeux.</p>
<p>Enfin, il parla. <em>Vous avez conscience de ce que vous avez provoqué ?</em> <em>Oui, monsieur. Et c’est justement pour cela que nous sommes ici. Pour tout mettre au clair, sans détour.</em> Il referma le dossier d’un geste sec.</p>
<p>Son regard se posa sur elle, puis sur l’étudiant. <em>Une relation entre un professeur et un élève, c’est contraire à l’éthique de cette institution. Vous le saviez.</em> <em>Ce n’était pas prévu. Ce n’était pas un jeu, ni un caprice. Ce n’est pas une histoire d’abus, ni de manipulation. C’est quelque chose qui est né lentement… et qui nous a changés, profondément.</em></p>
<p>Le doyen haussa un sourcil, croisant les bras. <em>Quand j’ai compris ce que je ressentais, j’ai tout fait pour résister. Je me suis battue contre mes sentiments, monsieur. Parce que je sais ce que cela représente, ce que cela coûte. Mais à un moment donné… ce n’était plus une question de contrôle. C’était une question d’honnêteté. Et je refuse de vivre dans le mensonge.</em> Un silence.</p>
<p><em>Et vous croyez que ça suffit ? Des sentiments ?</em> <em>Ce n’est pas que des sentiments. J’étais un mauvais élève. Un gosse insolent, perdu. Et c’est cette relation, cette rencontre, qui m’a forcé à changer. À me regarder en face. J’ai bossé, j’ai appris le respect, l’engagement. Pas pour elle. Pour moi. Mais c’est elle qui m’a montré ce que j’étais capable de devenir.</em></p>
<p>Le doyen le fixa un long moment. Puis regarda Julie. <em>Vous comprenez que même si votre relation n’est pas illégale, elle trouble la confiance entre enseignants et étudiants ?</em> <em>Je le comprends. Mais ce lien n’a jamais affecté mes cours, ni mon éthique professionnelle. J’ai même demandé à être déplacée avant que quoi que ce soit ne se concrétise. Aujourd’hui, je suis prête à prendre mes responsabilités. Mais je refuse de laisser cette histoire être salie. Ce n’est pas un scandale. C’est un amour réel, lucide, assumé.</em></p>
<p>Le doyen soupira. Longuement. Il s’appuya contre son fauteleur. <em>Ce que vous demandez… c’est d’officialiser quelque chose que tout le monde considère encore comme une transgression.</em> <em>Non. On ne demande pas de bénédiction. Juste qu’on soit traités avec vérité et justice. Et qu’on ne nous oblige pas à vivre comme des fantômes à cause d’une norme rigide.</em></p>
<p>Un long silence s’installa. Puis enfin, le doyen se leva lentement. <em>Je vais convoquer un conseil. Vous pourrez y parler. En public cette fois. Je ne vous promets pas qu’ils seront compréhensifs… mais je vous promets qu’ils vous écouteront.</em> Julie hocha la tête. L’étudiant aussi. Ils n’avaient plus peur. Ils étaient prêts à tout affronter.</p>` },
            35: { title: "Chapitre 35 – Rassembler les voix", content: `
            <p>Le lendemain de l’entretien avec le doyen, le soleil semblait plus froid que d’habitude. Dans le petit parc près du campus, ils s’étaient installés sur un banc en bois, un carnet posé entre eux. <em>— Le conseil, ce ne sera pas un simple échange… Ce sera un jugement, à demi-mot. S’ils sentent qu’on est seuls, ils décideront sans hésiter.</em></p>
<p>Il prit le carnet. <em>— Alors on ne sera pas seuls. Il y a des gens autour de nous qui savent. Qui ont vu ce que j’étais… et ce que je suis devenu.</em> <em>— Il faut qu’ils soient prêts à parler. À se lever pour nous. Et ça, ce n’est pas rien.</em> Il nota plusieurs noms dans le carnet.</p>
<p><em>— Riku, il m’a vu galérer avec les devoirs. C’est lui qui m’a aidé à réviser quand j’ai commencé à changer. Il comprend.</em> <em>— Et Midori. Une ancienne étudiante. Elle m’a toujours soutenue. Elle pourrait témoigner sur ma rigueur, mon respect des limites, même quand tout était flou.</em> <em>— Le professeur Tanaka aussi. Il n’aime pas le comité, mais il respecte ton travail. Je suis sûr qu’il ne t’abandonnerait pas.</em></p>
<p>Julie se tut un instant, puis souffla : <em>— Tu sais que, si on les implique, ils prendront des risques. Des vrais.</em> <em>— On ne leur demandera rien qu’une chose : la vérité. Pas de nous défendre comme des héros. Juste dire ce qu’ils ont vu. Ce qu’ils savent.</em></p>
<p>Plus tard dans la journée, ils commencèrent à rencontrer leurs soutiens, un par un. Riku, hésitant d’abord, finit par accepter. <em>— C’était flagrant, mec. Tu faisais le clown, t’étais perdu… Et puis un jour, t’as commencé à fermer ta gueule, à lire des bouquins. Je pensais que t’étais malade ! Mais maintenant que je vois où t’en es… Ouais, je peux dire ça devant n’importe qui.</em></p>
<p>Midori, rencontrée dans une vieille salle de lecture, les yeux brillants. <em>— Julie, vous avez été la prof la plus humaine que j’ai connue. Si quelqu’un insinue que vous avez manipulé cet élève, c’est qu’il n’a jamais mis les pieds dans votre classe. Je témoignerai, sans hésiter.</em></p>
<p>Le professeur Tanaka, plus réservé. <em>— Je n’approuve pas la relation. Mais je ne peux pas nier ce que j’ai observé. Nagatoro a changé. Et vous, Julie, vous êtes restée droite malgré tout. Je viendrai. Mais je dirai ce que je pense, sans enjoliver.</em> Julie hocha la tête, reconnaissante. <em>— C’est tout ce qu’on vous demande.</em></p>
<p>La veille du conseil, ils avaient rassemblé une petite équipe. Pas une armée. Mais des voix. Authentiques. Fières. Prêtes à dire la vérité, même si elle dérangeait.</p>` },
            36: { title: "Chapitre 36 – La veille", content: `
            <p>La nuit était tombée sur la ville comme une couverture lourde. Ils étaient seuls, dans l’appartement de Julie. Une lumière tamisée éclairait la pièce. Dehors, les néons lointains du centre-ville pulsaient doucement.</p>
<p>Assis sur le canapé, ils n’avaient pas vraiment besoin de parler. Le silence entre eux était apaisant. <em>— J’ai peur. Je le cache bien, peut-être. Mais j’ai peur.</em> Il se tourna vers elle, doucement. <em>— Moi aussi. J’ai l’impression de marcher sur un fil, au-dessus du vide. Mais je suis avec toi. Et rien que ça… ça change tout.</em></p>
<p>Elle se lova contre lui, sa tête contre son torse. <em>— Je me demande souvent… Si on avait résisté. Si j’avais continué à fuir, à t’ignorer. Est-ce que tu serais devenu celui que tu es aujourd’hui ?</em> <em>— Je le serais devenu… peut-être. Mais sans cette force-là. Ce n’est pas toi qui m’as changé. C’est le fait de vouloir être digne de toi.</em></p>
<p>Un silence. <em>— J’ai mis des limites. J’ai tout fait pour qu’on ne franchisse pas la ligne. Et pourtant, j’ai fini par tomber.</em> Il sourit doucement. <em>— Ce n’est pas une chute. C’est un choix. Un risque. Et je le referais.</em></p>
<p>Elle releva les yeux vers lui, et dans un souffle : <em>— Si demain tout bascule… tu regretteras ?</em> Il posa sa main sur sa joue. <em>— Jamais.</em> Ils restèrent ainsi. Collés. Silencieux. Vivants. Le monde pouvait bien trembler demain — ce soir, il n’y avait que leurs battements de cœur en harmonie.</p>` },
            37: { title: "Chapitre 37 – Le conseil", content: `
            <p>L’amphithéâtre était méconnaissable. Transformé pour l’occasion en salle de délibération, il était plein à craquer : membres de l’administration, quelques enseignants, et même des étudiants qui avaient entendu parler de « l’affaire ». Au centre, une longue table. Derrière, six membres du comité disciplinaire, dont le doyen Igarashi. En face, deux chaises. Celles de Julie et de Teddy. Lorsqu’ils entrèrent, les murmures cessèrent net. Ils s’installèrent. Main dans la main, mais discrètement. Ils n’étaient plus professeur et élève, mais deux êtres prêts à défendre ce qu’ils avaient construit.</p>
<p><em>Cette séance est ouverte. Madame Julie Kizame, professeur de littérature, et monsieur Teddy Nagatoro, étudiant en licence, sont ici pour s’expliquer sur la nature de leur relation et son impact sur la vie universitaire.</em> Un autre professeur du comité prit la parole, froidement. <em>Vous avez conscience que votre relation soulève de graves questions d’éthique. Nous allons vous écouter. Ensuite, les témoins que vous avez sollicités s’exprimeront.</em></p>
<p>Julie inspira profondément. <em>J’ai longtemps lutté contre ce que je ressentais. Par respect pour mon métier, et par respect pour lui. Mais ce lien ne s’est pas imposé comme une faiblesse. Il s’est imposé comme une évidence. Je n’ai jamais utilisé ma position. Et le jour où j’ai compris que mes sentiments prenaient trop de place, j’ai demandé à ne plus avoir ce jeune homme en cours.</em> Elle marqua une pause. <em>Ce n’est pas une faute. C’est une décision d’adulte. Et je suis prête à en assumer toutes les conséquences. Mais je refuse de vivre cette histoire dans la honte.</em></p>
<p>Teddy prit la parole à son tour. Sa voix tremblait, mais il tenait bon. <em>J’étais un cancre. Insolent, paumé. Ce lien avec Julie m’a forcé à me regarder en face. À devenir un homme. Elle ne m’a jamais rien promis. Elle n’a jamais profité de sa position. Elle m’a respecté, même quand je ne me respectais pas moi-même.</em> Les membres du comité notaient. Impassibles.</p>
<p>Puis, l’un d’eux appela le premier témoin. Riku, nerveux, s’avança. <em>Je suis étudiant en licence d’histoire. J’ai vu ce que ce mec est devenu. Il est passé de dernier de la classe à major en deux semestres. Et ce n’était pas par magie. Il s’est mis à bosser comme un malade. Par respect pour lui-même. Par respect pour elle. Ce n’est pas une histoire de manipulation. C’est une histoire de croissance.</em></p>
<p>Midori, posée, parla ensuite. <em>J’ai eu Mme Kizame en littérature moderne. Elle a toujours mis une distance stricte avec ses étudiants. Elle était exigeante, juste, humaine. Si aujourd’hui elle s’affiche avec cet étudiant, c’est parce qu’elle n’a rien à cacher. Et parce qu’elle sait que son intégrité parle pour elle.</em></p>
<p>Le professeur Tanaka arriva enfin, un peu raide. <em>J’ai mes réserves, bien sûr. Mais je peux témoigner de deux choses. Premièrement : Julie Kizame est une enseignante irréprochable. Deuxièmement : ce garçon a changé. Radicalement. J’en ai été témoin.</em> Il marqua un silence, puis ajouta. <em>Le vrai problème ici, c’est qu’ils n’ont pas fui. Ils n’ont pas menti. Ils sont venus avec la vérité. Et je pense que ça mérite d’être entendu.</em></p>
<p>Le verdict suspendu. Un long silence s’installa dans la salle. Le doyen se leva. <em>Merci. Le conseil se retire pour délibérer.</em> Ils sortirent, laissant derrière eux une tension palpable. Julie et Teddy se regardèrent, silencieux. Fatigués. Mais unis.</p>` },
            38: { title: "Chapitre 38 – À huis clos", content: `
            <p>Ils avaient été autorisés à attendre dans une petite salle du bâtiment administratif. Une pièce sans fenêtre, avec juste deux chaises, une horloge murale, et un silence qui hurlait. Julie n’osait plus parler. Elle s’était assise au bord d’une chaise, les doigts croisés, l’œil fixe sur le sol. Il restait debout. Immobile.</p>
<p>Quelques minutes passèrent. Puis il murmura : <em>Ils vont nous détruire, tu penses ?</em> Julie ne répondit pas tout de suite. Elle prit le temps de se lever, lentement, et de venir vers lui. <em>Tu crois vraiment qu’après tout ça… je pourrais regretter ?</em> Elle glissa ses bras autour de lui. Il ferma les yeux.</p>
<p><em>Si jamais… ils nous demandent d’arrêter, tu feras quoi ?</em> Elle le regarda longuement. Puis sourit, triste mais déterminée. <em>On leur dira ce qu’ils veulent entendre. Mais en dedans, on saura. Moi, je saurai que je ne t’ai pas aimé par erreur.</em> Il posa son front contre le sien. Le silence revint, mais cette fois il était doux, chaud.</p>
<p><em>J’ai peur. Mais pas de perdre mon inscription. Pas de redoubler. Ce que je crains… c’est qu’on te blesse. Qu’on te fasse porter la faute.</em> <em>On partage tout, maintenant. Même les coups durs. Et quoi qu’il arrive… tu m’as donné quelque chose que personne n’a su m’offrir.</em> Il haussa un sourcil. <em>Quoi donc ?</em> Elle sourit, presque gênée. <em>Le courage de vivre pour moi. Pas seulement pour ma réputation.</em></p>
<p>Un coup léger à la porte. La voix d’un membre du comité : <em>Les membres du conseil sont prêts.</em> Ils se regardèrent une dernière fois. Puis se prirent la main, silencieusement. Et sortirent.</p>` },
            39: { title: "Chapitre 39 – Le verdict", content:`
            <p>L’amphithéâtre était silencieux comme un tombeau quand ils revinrent s’asseoir. Les membres du comité avaient repris leur place. Les témoins étaient toujours là. Le doyen, au centre, feuilletait ses notes, lentement. Julie sentait les battements de son cœur cogner contre ses côtes. Lui, les yeux baissés, serrait encore sa main discrètement.</p>

<p>Puis le doyen releva la tête. <em>Après avoir entendu les deux parties et les témoignages présentés, le comité a pris sa décision.</em> Un silence total. On aurait pu entendre une mouche voler.</p>

<p><em>Tout d’abord, nous reconnaissons que la relation entre un professeur et un étudiant peut porter atteinte à l’image de l’université, et générer un déséquilibre de pouvoir qui doit être strictement encadré.</em> Julie ne cilla pas. Elle s’attendait à cette entrée en matière.</p>

<p><em>Cependant… au vu des éléments exposés, des efforts visibles de l’étudiant, de la décision volontaire du professeur de se retirer de toute responsabilité pédagogique vis-à-vis de lui, et de l’absence de preuve d’abus d’autorité…</em> Il marqua une pause.</p>

<p><em>…le comité décide de ne pas engager de sanctions disciplinaires contre Mme Julie Kizame ou contre l’étudiant Teddy Nagatoro.</em> Un souffle parcourut la salle. Certains murmuraient. D’autres restaient figés.</p>

<p><em>Néanmoins, leur relation devra rester strictement déclarée et supervisée. Toute reprise de lien pédagogique direct entre les deux parties sera formellement interdite.</em> Il posa ses papiers.</p>

<p><em>Nous vous demandons de faire preuve de discrétion et de respect pour l’institution. Mais vous êtes libres. Et responsables de ce que vous bâtirez ensemble.</em></p>

<h3>Après la séance</h3>

<p>Quand ils sortirent dans la cour de la fac, la lumière du jour semblait irréelle. Julie n’arrivait pas à parler. Lui non plus. Mais au bout de quelques pas, il s’arrêta. La prit dans ses bras, là, en plein jour, devant le monde. Elle le laissa faire.</p>

<p>Quelques étudiants applaudirent timidement. D’autres chuchotaient. Mais ils s’en fichaient. <em>On a tenu. Ensemble.</em></p>

<p><em>Et maintenant… on vit.</em></p>

<h3>Épilogue – Une page tournée</h3>

<p>Le printemps était revenu au Japon. Le campus, en fleur, débordait d’énergie nouvelle. Étudiants en tee-shirts, cafés débordant sur les trottoirs, rires dans les couloirs. Rien n’indiquait que, quelques mois plus tôt, une tempête y avait soufflé.</p>

<p>Julie entrait dans son bureau, un sac rempli de copies à corriger. Elle était rayonnante, paisible. Sa réputation, un temps fragilisée, s’était lentement reconstruite. Grâce à son travail. Grâce à sa dignité. Grâce à ceux qui l’avaient soutenue. Elle n’enseignait plus dans le même département que lui. Une décision acceptée sans rancune.</p>

<p>Elle posa son sac, s’installa à son bureau… et sourit. Un petit mot attendait, plié en deux, glissé entre deux livres. <em>Rendez-vous à la bibliothèque. Salle silencieuse, au fond. Je t'ai trouvé une perle rare.</em></p>

<p>Elle secoua la tête en souriant. Il n’avait pas changé.</p>

<p>Dans la salle de lecture, il l’attendait, un livre à la main. <em>Tu te souviens de ce vieux roman dont tu me parlais tout le temps ? Celui que je n'ai jamais eu le courage de lire à l'époque ?</em></p>

<p><em>La Mer d'encre. Oui. Je m'en souviens très bien. Tu le détestais sans même l'avoir ouvert.</em></p>

<p>Il lui tendit le livre, marqué à moitié. <em>Je l'ai lu. Et j'ai pleuré. Comme un gosse.</em></p>

<p>Elle le regarda avec tendresse, s'asseyant à côté de lui. <em>Et qu'as-tu compris ?</em></p>

<p>Il posa sa main sur la sienne. <em>Que les histoires d'amour interdites ne sont pas faites pour être évitées. Elles sont faites pour être racontées. Et vécues… si on est prêt à les défendre.</em></p>

<p>Elle ne dit rien. Elle n'en avait pas besoin. Dehors, le vent soulevait les pétales de cerisiers. Le monde tournait. Les examens approchaient. Mais eux, dans ce coin silencieux de la bibliothèque, tournaient une dernière page.</p>

<p>Et en commençaient une nouvelle. Ensemble.</p>
<h3>FIN</h3>
            ` } // Ajoutez jusqu'au chapitre 39
        }
    },
    {
        id: 2,
        title: "L'Amour Interdit de la Bibliothécaire",
        author: "Émilie Noire",
        genre: ["Romance", "Drame", "Contemporain"],
        cover: "images/2T.jpg",
        description: "Une histoire d'amour émouvante.",
        chapters: 20,
        rating: 4.5,
        readers: 1890,
        favorite: true,
        pages: 10,
        novelChapters: {
            1: { title: "Chapitre 1 : La Nouvelle,", content:  `<p>Le premier jour de printemps, Éloïse fit son entrée dans la vieille bibliothèque municipale. 
            L'odeur des livres anciens l'enveloppa aussitôt, un mélange de papier jauni, de cuir et de poussière. 
            À vingt-cinq ans, elle était la nouvelle bibliothécaire, fraîchement diplômée et pleine d'idéaux.</p>
            
            <p>Ce qu'elle ne savait pas encore, c'est que parmi les rayonnages de bois sombre se cachait Léo, 
            un étudiant en littérature de dix-neuf ans qui passait ses après-midis à dévorer les classiques. 
            Leurs regards se croisèrent pour la première fois à la section "Romans du XIXe siècle". 
            Elle rangeait des Balzac, il cherchait un Stendhal.</p>
            
            <p>"Vous travaillez ici ?" demanda-t-il, surpris de voir un nouveau visage.</p>
            <p>"Depuis aujourd'hui", répondit-elle avec un sourire timide.</p>
            <p>À cet instant, ni l'un ni l'autre ne pouvait deviner que cet échange banal marquerait 
            le début d'une histoire qui défierait toutes les conventions...</p>`
            },
            2: { title: "Chapitre 2: Les Regards Furtifs", content: `<p>Les jours suivants, Léo vint à la bibliothèque plus souvent qu'à son habitude. 
            Il choisissait toujours la même table, celle qui offrait la meilleure vue sur le bureau d'Éloïse. 
            Elle, de son côté, remarquait sa présence régulière mais s'interdisait d'y penser.</p>
            
            <p>Un après-midi de pluie, alors que la bibliothèque était presque vide, 
            Éloïse s'approcha de sa table. "Vous lisez beaucoup de romans d'amour", remarqua-t-elle, 
            jetant un coup d'œil à la pile de livres.</p>
            <p>"Je cherche à comprendre", répondit-il sans lever les yeux.</p>
            <p>"Comprendre quoi ?"</p>
            <p>Il la regarda enfin. "Comment deux personnes savent qu'elles sont faites l'une pour l'autre."</p>
            
            <p>Éloïse sentit son cœur faire un bond. Elle se reprit rapidement. "Dans la vraie vie, 
            c'est rarement comme dans les livres." Elle retourna à son bureau, les joues légèrement rosies.</p>`
             },
            3: { title: "Chapitre 3: Le Premier Mot", content: `<p>Une semaine plus tard, Léo laissa un mot coincé dans "Les Hauts de Hurlevent". 
            Quand Éloïse rangea le livre, le petit papier tomba à ses pieds.</p>
            
            <p><em>"Chère bibliothécaire,<br>
            Les plus belles histoires ne sont-elles pas celles qu'on n'ose pas écrire ?<br>
            Un lecteur assidu."</em></p>
            
            <p>Elle regarda autour d'elle, cherchant des yeux le jeune homme. Il avait déjà quitté la bibliothèque. 
            Elle garda le mot dans la poche de son cardigan toute la journée, le relisant à plusieurs reprises.</p>
            
            <p>Le lendemain, elle glissa à son tour un message dans "Le Rouge et le Noir" qu'elle savait être son prochain livre : 
            <em>"Certaines histoires méritent d'être vécues avant d'être écrites."</em></p>`
             },
            4: { title: "Chapitre 4:La Tempête", content: `<p>Un violent orage éclata en fin d'après-midi, clouant les derniers visiteurs dans la bibliothèque. 
            L'électricité tomba, plongeant le bâtiment dans une pénombre inquiétante.</p>
            
            <p>"Tout le monde va bien ?" cria Éloïse dans l'obscurité.</p>
            <p>"Je suis ici", répondit une voix familière. C'était Léo.</p>
            <p>Elle alluma la lampe de poche de son téléphone et le trouva près des rayonnages de poésie.</p>
            <p>"La porte d'entrée est bloquée par une branche", annonça-t-il après avoir vérifié.</p>
            
            <p>Ils se retrouvèrent prisonniers, assis par terre entre les étagères, éclairés seulement par la faible lueur du téléphone. 
            Pendant deux heures, ils parlèrent de tout et de rien : de leurs livres préférés, de leurs rêves, de leurs peurs.</p>
            
            <p>Dans l'intimité de l'obscurité, les barrières tombèrent une à une.</p>`
             },
            5: { title: "Chapitre 5: Le Matin d'Après", content:  `<p>Au petit matin, les services municipaux dégagèrent l'entrée. 
            Éloïse et Léo émergèrent de la bibliothèque comme sortant d'une bulle hors du temps.</p>
            
            <p>Le soleil se levait, créant des reflets dorés sur les pavés encore humides.</p>
            <p>"Je... je dois rentrer", murmura Éloïse, soudain consciente de la réalité.</p>
            <p>"Hier soir", commença Léo, hésitant, "était-ce réel ou ai-je rêvé ?"</p>
            <p>"C'était réel", admit-elle doucement avant de tourner les talons.</p>
            
            <p>Au travail le lendemain, une tension nouvelle régnait entre eux. 
            Chaque regard, chaque parole était chargé de tout ce qui avait été dit dans l'obscurité.</p>
            
            <p>Éloïse se demanda combien de temps elle pourrait continuer à nier l'évidence.</p>`
             
            },
            6: { title: "Chapitre 6: Le Café Interdit", content:`<p>"Je sais un petit café près d'ici", proposa Léo un vendredi après-midi. 
            "Ils font le meilleur chocolat chaud de la ville."</p>
            
            <p>Éloïse hésita. Accepter serait franchir une ligne. Refuser serait nier ce qu'elle ressentait.</p>
            <p>"D'accord", finit-elle par dire. "Mais juste un chocolat."</p>
            
            <p>Le café "Aux Mots Doux" était un lieu chaleureux avec des livres en libre-service sur les étagères. 
            Ils choisirent un coin discret.</p>
            
            <p>"Pourquoi la littérature ?" demanda-t-elle, cherchant un sujet sûr.</p>
            <p>"Parce que les livres sont les seuls endroits où tout est possible", répondit-il. 
            "Où les différences d'âge, de statut, n'ont pas d'importance."</p>
            
            <p>Son regard disait clairement qu'il ne parlait plus seulement des livres.</p>`
            },
            7: { title: "Chapitre 7: La Frontière Franchies", content:  `<p>Le chocolat chaud devint une habitude hebdomadaire. 
            Chaque vendredi à 17h, ils se retrouvaient au même café, à la même table.</p>
            
            <p>Un soir de novembre, alors qu'ils marchaient côte à côte après leur rencontre, 
            leurs mains se frôlèrent. Une étincelle parcourut Éloïse. Sans réfléchir, 
            Léo prit sa main dans la sienne.</p>
            
            <p>Elle ne la retira pas.</p>
            
            <p>Ils marchèrent ainsi en silence pendant trois pâtés de maisons, 
            leurs doigts entrelacés parlant plus fort que n'importe quelle parole.</p>
            
            <p>"C'est compliqué", murmura-t-elle finalement.</p>
            <p>"Seules les choses importantes le sont", répondit-il en serrant doucement sa main.</p>`
            },
            8: { title: "Chapitre 8: Les Premiers Doutes", content:  `<p>Les rumeurs commencèrent à circuler à la bibliothèque. 
            Madame Girard, la bénévole de soixante-dix ans, les avait vus sortir ensemble du café.</p>
            
            <p>"Une bibliothécaire et un étudiant, ce n'est pas très professionnel", glissa-t-elle à Éloïse.</p>
            
            <p>La directrice de la bibliothèque, Madame Dubois, la convoqua dans son bureau.</p>
            <p>"Éloïse, tu es excellente dans ton travail. Mais il faut faire attention aux apparences."</p>
            <p>"Il n'y a rien d'inapproprié", protesta faiblement Éloïse.</p>
            <p>"Pas encore", répliqua la directrice avec un regard qui en disait long.</p>
            
            <p>Ce soir-là, pour la première fois, Éloïse annula leur rendez-vous par SMS.</p>`
             },
            9: { title: "Chapitre 9: La Distance", content:  `<p>Pendant deux semaines, Éloïse évita Léo. 
            Quand il venait à la bibliothèque, elle se réfugiait dans la réserve ou demandait à un collègue de le servir.</p>
            
            <p>Un jour, il lui laissa une lettre à la réception :</p>
            
            <p><em>"Éloïse,<br>
            Je comprends tes craintes. Le monde a des règles, des limites. 
            Mais je crois que certaines rencontres transcendent ces barrières. 
            Je serai au pont des Arts demain à 18h. Si tu viens, je saurai. 
            Si tu ne viens pas, je comprendrai et je cesserai de te importuner.<br>
            Léo"</em></p>
            
            <p>Elle lut la lettre dix fois, son cœur déchiré entre la raison et le désir.</p>`
             },
            10: { title: "Chapitre 10: Le Rendez-vous", content: `<p>À 17h55, Éloïse tournait en rond dans son appartement. 
            À 18h05, elle enfila son manteau. À 18h15, elle courait vers le pont.</p>
            
            <p>Il était là, adossé au parapet, regardant couler la Seine. 
            En la voyant approcher, essoufflée, un sourire immense illumina son visage.</p>
            
            <p>"Je ne suis pas sûre de faire le bon choix", avoua-t-elle en l'atteignant.</p>
            <p>"Moi non plus", admit-il. "Mais je suis sûr que ne pas essayer serait le pire choix."</p>
            
            <p>Sous le pont des Arts, avec les cadenas d'amour comme témoins silencieux, 
            ils s'embrassèrent pour la première fois. Le monde autour d'eux s'arrêta.</p>
            
            <p>C'était interdit, compliqué, risqué. Mais pour la première fois depuis longtemps, 
            Éloïse se sentait parfaitement à sa place.</p>`
             },
            11: { title: "Chapitre 11: Le Bonheur Caché", content:  `<p>Ils devinrent maîtres dans l'art du secret. 
            Leurs rendez-vous avaient lieu dans des endroits improbables : 
            la petite librairie du 5ème arrondissement, le parc Buttes-Chaumont les jours de pluie, 
            le cinéma indépendante du Quartier Latin.</p>
            
            <p>Éloïse découvrait Paris à travers les yeux de Léo. 
            Il lui montrait ses endroits préférés : la cour cachée derrière la Sorbonne, 
            le petit jardin secret du Musée Rodin, la librairie anglophone qui servait du thé.</p>
            
            <p>"Tu redécouvres ta propre ville", remarqua-t-il un jour.</p>
            <p>"Je redécouvre bien plus que ça", répondit-elle en lui prenant la main.</p>
            
            <p>Pour un temps, ils réussirent à créer leur propre monde, 
            une bulle où seuls existaient leurs rires et leurs conversations à n'en plus finir.</p>`
             },
            12: { title: "Chapitre 12: L'Incident", content: `<p>Tout bascula un mardi après-midi. 
            Léo avait oublié son carnet de notes à la bibliothèque. 
            Éloïse, voyant qu'il contenait son numéro de téléphone sur la couverture, 
            décida de le lui apporter à la faculté.</p>
            
            <p>Alors qu'elle lui tendait le carnet dans le hall de l'université, 
            un camarade de classe de Léo les aperçut. "Eh bien, Léo ! Tu ne m'avais pas dit que tu sortais avec une vraie femme !" lança-t-il avec un rire gras.</p>
            
            <p>La remarque attira l'attention des étudiants alentour. 
            Éloïse, rougissant, s'éclipsa rapidement.</p>
            
            <p>Le lendemain, une photo floue d'eux deux circulait sur les réseaux sociaux des étudiants. 
            La légende : "Quand ta copine pourrait être ta prof.</p>`
             },
            13: { title: "Chapitre 13: La Confrontation", content: `<p>Madame Dubois montra la photo imprimée à Éloïse. 
            "Explique-moi ça", demanda-t-elle, le visage sévère.</p>
            
            <p>"C'est... compliqué", commença Éloïse.</p>
            <p>"Non, c'est très simple. Soit cette relation cesse immédiatement, 
            soit je dois reconsidérer ton poste ici."</p>
            
            <p>Pendant ce temps, à la faculté, un professeur de Léo l'avait convoqué. 
            "Monsieur Delarue, l'université a une politique stricte concernant les relations 
            entre étudiants et personnel d'institutions partenaires. La bibliothèque municipale 
            fait partie de nos partenaires."</p>
            
            <p>Ils se retrouvèrent le soir même, désemparés. 
            Pour la première fois, la réalité extérieure faisait irruption dans leur bulle.</p>`
             },
            14: { title: "Chapitre 14:La Décision", content:  `<p>"Je pourrais démissionner", proposa Éloïse.</p>
            <p>"Et faire quoi ?"</p>
            <p>"Je ne sais pas. Une autre bibliothèque. Un autre métier."</p>
            
            <p>Léo secoua la tête. "Je ne peux pas te laisser tout sacrifier pour moi."</p>
            <p>"Ce n'est pas un sacrifice si c'est un choix."</p>
            
            <p>Ils marchèrent longtemps en silence le long des quais. 
            La Tour Eiffel scintillait au loin, indifférente à leur dilemme.</p>
            
            <p>"Et si on prenait du recul ?" suggéra finalement Léo. 
            "Le temps que je termine ma licence. Dans six mois, je ne serai plus étudiant."</p>
            
            <p>Éloïse sentit son cœur se serrer. "Six mois..."</p>
            <p>"Six mois, puis plus rien ne nous séparera."</p>`
             
            },
            15: { title: "Chapitre 15: Les Adieux Temporaires", content:  `<p>Ils se dirent au revoir devant la bibliothèque, 
            à l'endroit même où ils s'étaient rencontrés.</p>
            
            <p>"Je t'écrirai", promit Léo. "Tous les jours."</p>
            <p>"Je garderai tes lettres dans le tiroir du bas, sous les registres d'emprunt."</p>
            
            <p>Leur dernier baiser fut doux-amer, plein d'espoir et de peur mêlés.</p>
            
            <p>Les premiers jours furent les plus difficiles. 
            Éloïse sursautait chaque fois que la porte de la bibliothèque s'ouvrait. 
            Léo passait devant sans entrer, se contentant d'un regard à travers la vitre.</p>
            
            <p>Leurs lettres devinrent leur oxygène. Des mots sur du papier, 
            des confessions, des rêves, des poèmes.</p>`
             },
            16: { title: "Chapitre 16: Les Lettres", content:  `<p><em>"Ma chère Éloïse,<br>
            Aujourd'hui, en cours de littérature du XIXe, nous avons étudié Flaubert. 
            Le professeur parlait de l'adultère comme d'une transgression sociale. 
            J'ai pensé à nous. Nous ne transgressons aucune loi morale, seulement des conventions. 
            Et pourtant, on nous traite comme des criminels. 
            L'amour serait-il donc un crime quand il ne suit pas les règles ?<br>
            À toi, Léo"</em></p>
            
            <p><em>"Mon cher Léo,<br>
            J'ai rangé la section poésie aujourd'hui. Chaque vers d'amour me parlait de toi. 
            Rumi disait : 'L'amour est le pont entre toi et tout.' 
            Notre pont existe, même si pour l'instant, nous ne pouvons le traverser.<br>
            Ton Éloïse"</em></p>
            
            <p>Les lettres s'accumulèrent, créant leur propre roman épistolaire.</p>`
              
             },
            17: { title: "Chapitre 17: L'Accident", content:  `<p>Un soir de février, alors qu'Éloïse fermait la bibliothèque, 
            son téléphone vibra. C'était un hôpital.</p>
            
            <p>"Madame, nous avons un jeune homme ici, Léo Delarue. 
            Il a votre numéro en contact d'urgence."</p>
            
            <p>Elle courut à l'hôpital, le cœur battant la chamade. 
            Léo avait été renversé par une voiture en sortant de la faculté. 
            Fracture de la jambe, commotion cérébrale, mais stable.</p>
            
            <p>Quand elle entra dans sa chambre, il ouvrit les yeux avec difficulté. 
            "Éloïse...", murmura-t-il.</p>
            
            <p>À cet instant, toutes les règles, toutes les conventions volèrent en éclats. 
            Elle resta à son chevet toute la nuit, tenant sa main.</p>
            
            <p>Le personnel soignant les prenait pour un jeune couple comme les autres. 
            Pour une nuit, ils purent être juste ça : un couple.</p>`
             },
            18: { title: "Chapitre 18: Le Choix Définitif", content: `<p>La convalescence de Léo dura un mois. 
            Éloïse vint le voir chaque jour après le travail, 
            apportant des livres et restant des heures à discuter.</p>
            
            <p>Un après-midi, Madame Dubois la surprit en train de quitter l'hôpital. 
            "Éloïse, nous devons parler."</p>
            
            <p>De retour à la bibliothèque, la directrice fut catégorique. 
            "Ton contrat se termine à la fin du mois. Je ne le renouvellerai pas."</p>
            
            <p>Éloïse hocha la tête, étonnamment calme. "Je comprends."</p>
            <p>"Tu n'as même pas envie de te battre ?"</p>
            <p>"Je me bats pour quelque chose de plus important."</p>
            
            <p>Elle rangea son bureau ce soir-là avec une sérénité nouvelle. 
            Parfois, perdre une bataille permet de gagner la guerre.</p>`
                          },
            19: { title: "Chapitre 19: La Nouvelle Vie", content:  `<p>Le jour où Léo retira son plâtre coïncida avec le dernier jour de travail d'Éloïse. 
            Ils se retrouvèrent au même café où tout avait commencé.</p>
            
            <p>"J'ai une proposition", annonça Éloïse. "J'ai économisé pendant ces mois. 
            Assez pour lancer quelque chose."</p>
            
            <p>Elle sortit un dossier de son sac. "Une librairie-café. 
            Un endroit où les gens pourraient lire, discuter, boire un thé. 
            Et où le personnel pourrait tomber amoureux des clients sans que personne n'y trouve à redire."</p>
            
            <p>Léo parcourut le plan d'affaires, impressionné. "C'est... génial."</p>
            <p>"J'aurais besoin d'un associé. Quelqu'un qui connaît bien la littérature 
            et qui n'a pas peur de défier les conventions."</p>
            
            <p>Il sourit, ce sourire qui l'avait ensorcelée dès le premier jour. 
            "Tu sais que je termine ma licence dans deux mois ?"</p>
            <p>"Parfait timing."</p>`
             },
            20: { title: "Chapitre 20: Épilogue : Aux Mots Libres", content: `<p>Six mois plus tard, "Aux Mots Libres" ouvrait ses portes dans le Marais. 
            La devanture bleue attirait les regards, et l'odeur de café frais et de livres neufs invitait à entrer.</p>
            
            <p>À l'intérieur, Éloïse rangeait des romans pendant que Léo préparait des cappuccinos. 
            Il portait encore une légère claudication de son accident, mais son sourire était plus radieux que jamais.</p>
            
            <p>Un client régulier, une vieille dame qui venait tous les jours lire le journal, 
            leur demanda un jour : "Vous formez un beau couple. Depuis combien de temps êtes-vous ensemble ?"</p>
            
            <p>Éloïse et Léo échangèrent un regard complice.</p>
            <p>"Depuis toujours", répondit Éloïse.</p>
            <p>"Et pour toujours", ajouta Léo en lui prenant la main.</p>
            
            <p>Sur le mur du fond, une citation de Victor Hugo qu'Éloïse avait calligraphiée elle-même : 
            "L'amour, c'est l'infini mis à la portée des caniches." Et en dessous, en plus petit : 
            "Et parfois, il se cache entre les rayons d'une bibliothèque."</p>
            
            <h3>FIN</h3>`
             },
            
            // Ajoutez jusqu'au chapitre 15
        }
    },
    {
        id: 3,
        title: "L'Éclat Trompeur de l'Or",
        author: "Teddy Ted",
        genre: "fantasy",
        cover:"images/grarence.jpg" ,
        description: "Aristocrate déchue qui vend son image...",
        chapters: 20,
        rating: 4.9,
        readers: 3120,
        favorite: false,
        pages: 10,
        novelChapters: {
            1: { title: "Chapitre 1 : Les Trois Filles", content: `<p><strong>Chloé - L'étudiante pauvre</strong> Chloé regarde son café trop cher. 6,50 euros. Beaucoup d'argent pour elle. Elle est étudiante, boursière. Ses parents ont peu d'argent. Autour d'elle, des filles riches rient. Leurs sacs valent six mois de loyer de son studio.</p>
            <p>Son téléphone vibre. Sa mère : "Papa a une augmentation ! 150€ de plus par mois." Chloé compare : 150€ = 23 cafés comme celui-ci. Ou un sac à main pour les filles riches. Elle se sent invisible. Différente.</p>
            <p><strong>Garance - L'aristocrate sans argent</strong> Garance met une vieille robe de sa grand-mère. Belle mais usée. Elle habite un grand hôtel particulier, mais il est presque vide. Elle n'a plus d'argent.</p>
            <p>Le majordome, Édouard, annonce : "Votre taxi est arrivé." Elle va à une soirée chez des nouveaux riches. Elle a faim, mais fait semblant de ne pas. Un homme la regarde. Costume cher, montre chère. Il évalue sa beauté, son nom de famille. Garance sait : il voit ce qu'elle peut lui apporter. Pas qui elle est.</p>
            <p><strong>Sofia - La fille riche et seule</strong> Sofia parle fort au restaurant. "Tout a un prix ! Les relations aussi !" Autour d'elle, des hommes riches l'écoutent. Ou regardent son décolleté.</p>
            <p>Son téléphone vibre. Sa mère : "Papa est malade. Viens dimanche ?" Sofia répond vite : "Non, j'ai travail. J'envoie une infirmière. Je paie." Pour elle, l'argent résout tout. Même les problèmes de famille. Mais le soir, dans son grand appartement vide, elle se demande : peut-on acheter le bonheur ?</p>
            `},
            2: { title: "Chapitre 2: La Rencontre", content:` <p>La galerie d'art est pleine de gens riches. Chloé est là pour un stage. Elle regarde une œuvre faite avec des pièces de monnaie. Garance arrive. Elle regarde la même œuvre. "Intéressant", dit Garance sans regarder Chloé. "L'argent qui écrase la culture."</p>
            <p>Sofia arrive en riant. "Mais non ! C'est une fête de l'argent ! Regardez comme ça brille !" Les trois femmes se regardent. Elles sont différentes, mais chacune a un problème avec l'argent. "Je suis Sofia." "Garance." "Chloé."</p>
            <p>Sofia propose : "Un verre ? Je connais un bon endroit." Chloé et Garance acceptent. Au bar, Sofia commande une bouteille chère sans regarder le prix. Chloé est impressionnée. Garance est gênée. Elles parlent. Sofia a trop d'argent. Garance a un nom mais pas d'argent. Chloé n'a ni l'un ni l'autre. Une amitié bizarre commence.</p>
            ` },
            3: { title: "Chapitre 3: Le Premier Choix de Garance", content: `<p>De retour chez elle, Garance regarde les factures. Électricité : 1200€ en retard. Taxes : 8000€. Salaire d'Édouard : 2300€. Elle ne peut pas tout payer.</p>
            <p>Le téléphone sonne. Une voix inconnue. "Mademoiselle de Saint-Clair ? Je m'appelle Antoine Mercier. On m'a donné votre numéro." "Oui ?" "Je cherche une compagnie pour des soirées. Vous seriez payée. 5000€ par sortie."</p>
            <p>5000€ ! Garance respire fort. "Que dois-je faire ?" "Être charmante. Parler. Porter de belles robes. Votre nom a de la valeur." Il veut acheter son nom, son éducation, son élégance. Pas son corps. Juste son image.</p>
            <p>"Je réfléchis", dit Garance. "Je rappelle demain." Elle raccroche. Regarde les factures. Regarde le portrait de son arrière-grand-mère.</p>
            <p>Que faire ? Garder sa fierté et tout perdre ? Ou vendre son image et sauver la maison familiale ? La nuit passe. Elle ne dort pas.</p> 
             ` },
            4: { title: "Chapitre 4:  L'Acceptation", content: ` <p>La nuit fut longue. Garance tourna et retourna dans son lit trop grand, 
            dans cette chambre trop grande, dans cette maison trop grande. 
            Les chiffres dansaient devant ses yeux fermés : 1 234€, 8 750€, 2 300€. 
            Des chiffres rouges. Des chiffres qui criaient.</p>
            
            <p>À 3h du matin, elle se leva. Elle mit sa robe de chambre et descendit 
            l'escalier en colimaçon. Ses pas résonnaient dans le silence. 
            La maison semblait morte. Une belle morte, mais morte quand même.</p>
            
            <p>Elle alla dans le salon. Alluma une petite lampe. La lumière faible 
            éclaira les meubles recouverts de draps blancs. Comme des fantômes. 
            Sa famille était devenue des fantômes.</p>
            
            <p>Elle prit le portrait de son arrière-grand-mère, Adélaïde. 
            La peinture était craquelée. Les yeux sévères la fixaient.</p>
            
            <p>"Que ferais-tu, toi ?" murmura Garance. "Tu as épousé un homme riche 
            pour sauver la famille. Est-ce que c'est si différent ?"</p>
            
            <p>Le portrait ne répondit pas. Mais dans ses yeux peints, Garance crut 
            voir une lueur de compréhension. Les femmes de sa famille avaient 
            toujours fait ce qu'il fallait. Ce qu'elles devaient.</p>
            
            <p>Le jour se leva. Paris s'éveilla. Garance était toujours assise 
            dans le salon, le portrait sur ses genoux.</p>
            
            <p>À 9h, Édouard entra. Il apportait un plateau avec du café et une 
            tartine. Son regard tomba sur le portrait. Il comprit.</p>
            
            <p>"Mademoiselle..." commença-t-il.</p>
            
            <p>"Ne dis rien, Édouard. S'il te plaît."</p>
            
            <p>Il hocha la tête, triste. Il sortit. Garance but son café froid.</p>
            
            <p>La journée passa. Elle regarda son téléphone. Attendu. 
            Elle sortit dans le jardin. Attendu. Elle tria de vieilles photos. 
            Attendu.</p>
            
            <p>À 22h47 exactement, le téléphone sonna.</p>
            
            <p>Garance le regarda vibrer sur la table. Une, deux, trois sonneries. 
            Elle respira profondément. Ferma les yeux. Puis décrocha.</p>
            
            <p>"Allô ?"</p>
            
            <p>"Mademoiselle de Saint-Clair. Antoine Mercier. Avez-vous réfléchi ?"</p>
            
            <p>Sa voix était calme. Polie. Comme s'il parlait d'une affaire normale. 
            Pas de la vente d'une personne.</p>
            
            <p>Garance regarda par la fenêtre. Les lumières de Paris brillaient. 
            Des gens vivaient. Riaient. Aimaient. Sans savoir qu'à quelques kilomètres, 
            une femme vendait son nom pour sauver des murs.</p>
            
            <p>"Oui", dit-elle. Sa voix était étrange. Raide. "J'ai réfléchi."</p>
            
            <p>Un silence. Puis : "Et ?"</p>
            
            <p>Elle ferma les yeux très fort. "J'accepte."</p>
            
            <p>Les mots étaient sortis. Comme un caillou tombé dans un puits. 
            On ne pouvait plus les rattraper.</p>
            
            <p>"Excellent", dit Mercier. Sa voix n'avait pas changé. Pas de joie. 
            Pas de triomphe. Juste la satisfaction d'une transaction réussie. 
            "Vendredi prochain. Le Ritz. Je vous enverrai les détails."</p>
            
            <p>Il raccrocha. Garance resta immobile, le téléphone à l'oreille. 
            La tonalité bipait. Bip. Bip. Bip. Comme un cœur qui bat. 
            Ou qui s'arrête.</p>
            
            <p>Elle posa le téléphone. Ses mains tremblaient. Elle les serra 
            l'une contre l'autre. Mais ça ne servait à rien. Tout tremblait en elle.</p>
            
            <p>Elle se leva. Marcha jusqu'au miroir du hall. Se regarda.</p>
            
            <p>"Tu as accepté", dit-elle à son reflet. "Tu es maintenant 
            une femme à louer. Une aristocrate de location."</p>
            
            <p>Son reflet ne répondit pas. Mais ses yeux... ses yeux avaient changé. 
            Quelque chose de dur était entrée. Une froideur. Une distance.</p>
            
            <p>Elle monta dans sa chambre. S'allongea sur son lit. Fixa le plafond.</p>
            
            <p>Le pire, ce n'était pas ce qu'elle allait faire. 
            Le pire, c'était qu'une partie d'elle était... soulagée. 
            Plus de soucis d'argent. Plus de peur du lendemain. 
            Plus de honte devant Édouard.</p>
            
            <p>Elle avait vendu son nom. Mais elle avait acheté la paix. 
            Pour un temps.</p>
            
            <p>Elle ferma les yeux. Des larmes coulèrent sur ses tempes. 
            Chaudes. Salées. Comme la mer qui avait bercé ses ancêtres. 
            Comme les larmes que toutes les femmes de sa famille avaient 
            cachées derrière des sourires parfaits.</p>
            
            <p>Elle s'endormit ainsi. Vêtue. Maquillée. Parfaite. 
            Déjà en représentation.</p>
            ` },
            5: { title: "Chapitre 5: La Première Soirée", content: `<p>Vendredi arriva trop vite. Garance passa la journée à préparer 
            sa transformation. Ce n'était pas juste s'habiller. C'était 
            devenir quelqu'un d'autre. La version "location" de Garance de Saint-Clair.</p>
            
            <p>À 14h, une femme vint à la maison. Coiffeuse et maquilleuse, 
            envoyée par Mercier. Elle ne parlait pas beaucoup. Juste : 
            "Tournez la tête s'il vous plaît. Fermez les yeux."</p>
            
            <p>Elle transforma Garance. Les cheveux lissés, relevés. 
            Le maquillage parfait, mais naturel. "Il faut paraître 
            soi-même, mais en mieux", expliqua la femme.</p>
            
            <p>À 16h, un coursier apporta une boîte. Dedans, une robe. 
            Soie noire, simple, chic. Avec des chaussures et un petit sac. 
            Pas de ticket de prix. Garance comprit : c'était mieux 
            de ne pas savoir.</p>
            
            <p>À 18h, elle était prête. Elle se regarda dans le miroir. 
            Elle était belle. Très belle. Mais ce n'était pas elle. 
            C'était une poupée. Une poupée de luxe.</p>
            
            <p>Édouard entra. Il la regarda. Son visage se ferma.</p>
            
            <p>"La voiture est là, mademoiselle."</p>
            
            <p>"Merci, Édouard."</p>
            
            <p>Il hésita. "Mademoiselle... faites attention."</p>
            
            <p>Elle hocha la tête. Ne pouvait pas parler. La gorge serrée.</p>
            
            <p>La voiture était une Mercedes noire. Le chauffeur ouvrit la portière. 
            "Bonsoir, mademoiselle."</p>
            
            <p>Elle s'installa. La voiture partit. Paris défilait. Les lumières. 
            Les gens. La vie normale.</p>
            
            <p>Le Ritz. Le chauffeur l'aida à descendre. Le portier s'inclina. 
            "Mademoiselle de Saint-Clair. Monsieur Mercier vous attend."</p>
            
            <p>Elle entra. Le luxe l'enveloppa. Marbre, or, cristal. 
            Et cette odeur. L'odeur de l'argent vieux. Pas l'argent neuf, 
            bruyant. L'argent discret, sûr de lui.</p>
            
            <p>Mercier l'attendait dans le hall. Il la regarda approcher. 
            Ses yeux la parcoururent. Pas comme un homme regarde une femme. 
            Comme un collectionneur regarde un objet rare. Vérifiant 
            qu'il est en parfait état.</p>
            
            <p>"Mademoiselle." Il prit sa main, l'embrassa. Les lèvres 
            à peine un frisson sur sa peau. "Vous êtes ravissante."</p>
            
            <p>"Merci, monsieur."</p>
            
            <p>"Appelez-moi Antoine. Allons, notre table nous attend."</p>
            
            <p>La salle à manger privée était petite, intime. Une table 
            pour deux. Des fleurs partout. Une bouteille de champagne 
            dans un seau en argent.</p>
            
            <p>Le dîner commença. Garance était nerveuse. Mais ses années 
            de bonnes manières prirent le dessus. Elle savait quelle fourchette 
            prendre. Comment parler au serveur. Comment sourire.</p>
            
            <p>"Parlez-moi de votre enfance", demanda Mercier entre le foie gras 
            et le homard.</p>
            
            <p>Elle parla. Des étés en Normandie. Des chevaux. Des vieux livres 
            dans la bibliothèque. Elle enjoliva un peu. Rendit tout plus beau, 
            plus pur. C'était ce qu'il voulait acheter, après tout. Un rêve. 
            Une histoire.</p>
            
            <p>Il écoutait, intéressé. Posait des questions. "Et votre grand-père ? 
            Il a combattu pendant la guerre ?"</p>
            
            <p>Elle répondait. Chaque histoire valait de l'argent, elle le savait 
            maintenant. Chaque souvenir était une marchandise.</p>
            
            <p>Le dessert arriva. Un gâteau au chocolat magnifique. 
            Garance n'avait pas faim. Elle mangea quand même.</p>
            
            <p>"J'ai beaucoup apprécié cette soirée", dit Mercier en finissant 
            son café. "Vous êtes exactement ce que je cherchais."</p>
            
            <p>Il sortit une enveloppe de sa poche. La posa près de son verre. 
            Puis un petit écrin en velours noir.</p>
            
            <p>"Pour vous remercier."</p>
            
            <p>Garance regarda l'enveloppe. Regarda l'écrin. Ne les toucha pas.</p>
            
            <p>"Ouvrez", dit-il doucement.</p>
            
            <p>Elle ouvrit l'écrin d'abord. Des boucles d'oreilles. Diamants et saphirs. 
            Qui brillaient comme des étoiles volées.</p>
            
            <p>"C'est trop", murmura-t-elle.</p>
            
            <p>"Rien n'est trop pour vous."</p>
            
            <p>Elle ouvrit l'enveloppe. Des billets. Beaucoup de billets. 
            Elle ne compta pas. Pas ici. Pas devant lui.</p>
            
            <p>"La semaine prochaine, j'ai un voyage à Genève", continua Mercier. 
            "Deux jours. Des rencontres d'affaires. J'aimerais que vous veniez."</p>
            
            <p>Genève. Deux jours. Loin de Paris. Loin de tout.</p>
            
            <p>Garance hésita. Puis hocha la tête. "D'accord."</p>
            
            <p>Il sourit. Un vrai sourire, cette fois. "Parfait. 
            On se voit jeudi prochain alors."</p>
            
            <p>La voiture la ramena. La nuit était froide. Claire. 
            Les rues presque vides.</p>
            
            <p>Dans sa chambre, enfin seule, Garance compta l'argent. 
            Dix mille euros. Dix mille euros pour une soirée. 
            Pour des histoires. Pour un sourire.</p>
            
            <p>Elle posa l'argent sur la commode. À côté, les boucles d'oreilles 
            brillaient. Elle les mit. Se regarda dans le miroir.</p>
            
            <p>La femme dans le miroir était belle. Richement parée. 
            Mais ses yeux... ses yeux étaient vides. Comme les yeux 
            d'un mannequin. D'une poupée.</p>
            
            <p>Elle enleva les boucles d'oreilles. Les mit dans l'écrin. 
            Ferma le couvercle. Cache la lumière.</p>
            
            <p>Puis elle prit l'argent. Le rangea dans un tiroir. 
            Sous des sous-vêtements. Comme quelque chose de sale.</p>
            
            <p>Elle se déshabilla. Se lava longuement. Comme pour enlever 
            quelque chose. Une saleté invisible. Une trace.</p>
            
            <p>Au lit, elle fixa le plafond. Dix mille euros. 
            Les factures payées. Édouard payé. La maison sauvée. 
            Pour un mois.</p>
            
            <p>Elle avait réussi. Elle avait fait ce qu'il fallait faire.</p>
            
            <p>Alors pourquoi se sentait-elle si vide ? 
            Si... abîmée ?</p>
            
            <p>Elle ferma les yeux. Mais le sommeil ne vint pas. 
            Juste le souvenir du regard de Mercier. Évaluant. Calculant. 
            Donnant un prix à tout. À elle.</p>
            
            <p>Et le pire ? Elle avait accepté ce prix. 
            Elle avait dit oui.</p>
             ` },
            6: { title: "Chapitre 6: Le Système", content: `<p>Un mois passa. Garance avait maintenant un emploi du temps précis.
            Un système. Comme une machine bien huilée.</p>
            
            <p>Lundi : cours de maintien. Une femme sévère lui apprenait à marcher,
            à s'asseoir, à parler. "Pas trop fort. Pas trop vite. Sourire,
            mais pas trop. Vous êtes une lady, pas une actrice."</p>
            
            <p>Mardi : coiffeur. Un salon discret où les femmes riches vont.
            On ne parle pas de prix. On parle de "création". Garance se laissait faire.
            Comme une poupée qu'on coiffe.</p>
            
            <p>Mercredi : shopping. Avec la carte de crédit noire que Mercier lui avait donnée.
            "Pour vos besoins", avait-il dit. Elle achetait des robes, des chaussures.
            Des armes pour la guerre du luxe.</p>
            
            <p>Jeudi à dimanche : les soirées. Parfois avec Mercier. Parfois avec d'autres hommes.
            Car Mercier n'était pas le seul maintenant.</p>
            
            <p>Il y avait Karl. Allemand, 70 ans. Il aimait l'opéra. Il parlait de Wagner,
            de philosophie. Il payait pour avoir une femme cultivée à son bras.
            Une femme qui comprenait la musique.</p>
            
            <p>Il y avait Marco. Italien, 45 ans, marié. Il avait un yacht.
            Il emmenait Garance en Méditerranée. "Tu es comme une princesse",
            disait-il. Il achetait un rêve. Une évasion.</p>
            
            <p>Il y avait James. Américain, 35 ans. Jeune, riche, ennuyé.
            Il collectionnait les femmes avec des titres. "Une Française avec
            'une particule'", disait-il en riant. Comme si c'était un trophée.</p>
            
            <p>Garance avait appris à s'adapter. Avec Karl, elle était sérieuse,
            intelligente. Avec Marco, elle était enjouée, légère. Avec James,
            elle était distante, mystérieuse.</p>
            
            <p>Elle était devenue une actrice. Une très bonne actrice.
            Mais parfois, la nuit, elle oubliait qui elle était vraiment.
            La vraie Garance. Celle d'avant.</p>
            
            <p>Un après-midi, elle rencontra Sofia et Chloé dans un salon de thé.
            Sofia parlait fort, comme d'habitude.</p>
            
            <p>"La clé, c'est la rareté", expliquait Sofia. "Dis-leur que tu es occupée.
            Même si tu ne l'es pas. Fais-les attendre. L'argent aime attendre.
            Ça donne de la valeur."</p>
            
            <p>Chloé avait changé. Elle portait une robe neuve. Chic, chère.
            Elle travaillait maintenant dans une galerie d'art prestigieuse.
            Ses cheveux étaient coupés. Son maquillage était parfait.</p>
            
            <p>"Et toi, Garance ?" demanda Chloé. "Comment tu gères ? Avec tous ces... rendez-vous ?"</p>
            
            <p>Garance hésita. Devait-elle dire la vérité ?
            Parler des nuits où elle pleurait ? Des matins où elle se lavait
            longuement, comme pour se purifier ?</p>
            
            <p>Non. Pas ici. Pas maintenant.</p>
            
            <p>"Je gère", dit-elle simplement. Un sourire. Un haussement d'épaules.
            Comme si c'était facile. Comme si c'était normal.</p>
            
            <p>Sofia la regarda. Approuva d'un hochement de tête. "Tu apprends vite.
            C'est bien. Dans notre monde, il faut être forte."</p>
            
            <p>Notre monde. Garance regarda autour d'elle. Le salon de thé luxueux.
            Les clients riches. Les serveurs silencieux. Était-ce son monde maintenant ?
            Le monde des femmes qui vendent leur temps, leur image, leur âme ?</p>
            
            <p>Elle regarda Chloé. Chloé qui buvait son thé, les yeux baissés.
            Chloé qui changeait, elle aussi. Qui devenait plus dure. Plus froide.
            Comme si l'argent la transformait.</p>
            
            <p>"Je dois y aller", dit Garance soudain. "Un rendez-vous."</p>
            
            <p>Elle partit. Laissa de l'argent sur la table. Beaucoup d'argent.
            Comme pour prouver qu'elle en avait. Comme pour prouver qu'elle appartenait
            à ce monde maintenant.</p>
            
            <p>Dehors, elle respira profondément. L'air frais. L'air libre.
            Pour quelques secondes seulement. Puis elle monta dans la voiture
            qui l'attendait. Retourna dans sa cage dorée.</p>
             ` },
            7: { title: "Chapitre 7: La Double Vie", content: ` <p>Garance avait maintenant deux vies. Deux mondes. Deux Garance.</p>

            <p>Il y avait Garance la journée. Celle qui vivait dans le grand hôtel particulier.
            Qui parlait avec Édouard. Qui recevait des factures. Qui regardait
            le portrait de son arrière-grand-mère avec honte.</p>
            
            <p>"Tout va bien, Édouard", disait-elle. "Les affaires s'arrangent.
            J'ai trouvé des investisseurs."</p>
            
            <p>Édouard hochait la tête. Ne croyait pas. Mais ne disait rien.
            Par loyauté. Par pitié, peut-être.</p>
            
            <p>Il y avait Garance la nuit. Celle qui mettait des robes de créateur.
            Qui souriait aux hommes riches. Qui racontait des histoires de famille.
            Qui acceptait des enveloppes pleines d'argent.</p>
            
            <p>Les deux Garance ne se parlaient pas. Ne se regardaient pas.
            Comme deux étrangères qui partagent le même corps.</p>
            
            <p>Un soir, après un dîner particulièrement difficile avec James
            (qui avait bu trop et avait posé des questions personnelles),
            Garance croisa Chloé dans les toilettes d'un restaurant chic.</p>
            
            <p>"Garance ! Mon Dieu, tu es toute pâle."</p>
            
            <p>Garance se regarda dans le miroir. Effectivement, elle était pâle.
            Ses yeux étaient cernés. Elle avait l'air épuisée.</p>
            
            <p>"Je suis fatiguée, c'est tout. Beaucoup de sorties."</p>
            
            <p>Chloé s'approcha. Parla bas. "Ces sorties... avec ces hommes...
            Je ne veux pas être indiscrète, mais... fais attention, d'accord ?"</p>
            
            <p>Garance se raidit. "De quoi parles-tu ? Ce sont des amis.
            Des relations mondaines. Rien de plus."</p>
            
            <p>Chloé la regarda. Longuement. Dans les yeux. "Garance...
            Je ne suis pas idiote. Sofia m'a expliqué... comment ça marche.
            Les femmes comme nous... qui avons besoin d'argent..."</p>
            
            <p>Nous. Garance sentit un mélange de soulagement et de honte.
            Soulagement de ne plus être seule. Honte que Chloé sache.
            Qu'elle comprenne.</p>
            
            <p>"Ça va, Chloé. Je gère."</p>
            
            <p>"Mais est-ce que ça va vraiment ?" insista Chloé. "Tu as l'air...
            malheureuse."</p>
            
            <p>Le mot frappa Garance. Malheureuse. Oui, c'était ça.
            Elle était malheureuse. Profondément, terriblement malheureuse.
            Mais elle avait de l'argent. Beaucoup d'argent. Est-ce que l'argent
            ne devait pas acheter le bonheur ?</p>
            
            <p>"Je dois y aller", dit Garance brusquement. "Il m'attend."</p>
            
            <p>Chloé posa une main sur son bras. "Garance, attends...
            Si tu as besoin de parler... de vraie parler..."</p>
            
            <p>Garance se dégagea. Trop vite. Trop brutalement.
            "Merci. Mais non. Tout va bien. Vraiment."</p>
            
            <p>Elle sortit des toilettes. Traversa le restaurant.
            Sentit sur elle le regard de James. Impatient. Possessif.
            Il payait pour son temps. Elle était en retard.</p>
            
            <p>À table, James ne dit rien. Mais il commanda une autre bouteille
            de vin. Celle la plus chère de la carte. Comme une punition.
            Comme un rappel : c'est moi qui paie. C'est moi qui décide.</p>
            
            <p>Garance but son vin. Souriait. Parlait. Jouait son rôle.
            Mais dans sa tête, une phrase tournait : <i>Tu as l'air malheureuse.</i></p>
            
            <p>Malheureuse. Oui. Mais riche. Est-ce que c'était mieux
            que d'être pauvre et malheureuse ? Elle ne savait plus.</p>
            
            <p>La soirée finit enfin. James la raccompagna à sa voiture.
            Lui donna une enveloppe. Moins que d'habitude.</p>
            
            <p>"Tu étais distante ce soir", dit-il. "Essaie de faire mieux
            la prochaine fois."</p>
            
            <p>Puis il partit. Sans un baiser. Sans un au revoir.
            Juste un client mécontent.</p>
            
            <p>Dans la voiture, Garance ouvrit l'enveloppe. Trois mille euros.
            Trois mille euros pour une soirée de malaise. Pour un sourire forcé.
            Pour un morceau de son âme.</p>
            
            <p>Elle ferma les yeux. Des larmes coulèrent.
            Mais elle les essuya vite. Il ne fallait pas abîmer le maquillage.
            Il fallait rester belle. Toujours belle.
            Pour la prochaine vente.</p>
            ` },
            8: { title: "Chapitre 8:  L'Accident", content:  `

            <p>Saint-Tropez en juillet. Le soleil tape fort. La mer est bleue comme un saphir.
            Sur le yacht de Marco, tout brille. Le bois verni. Le métal chromé. Les verres en cristal.
            Et les gens. Les gens surtout brillent. De sueur, d'huile solaire, et d'argent.</p>
            
            <p>Garance est là depuis deux jours. Marco l'a "invitée" pour le week-end.
            Cinq mille euros par jour. Plus les cadeaux. Un prix élevé, même pour lui.
            Mais il veut montrer qu'il peut se l'offrir. Une aristocrate française sur son bateau.
            Comme un tableau de maître. Comme une voiture de sport.</p>
            
            <p>"Tu aimes ?" demande Marco en lui tendant un verre de champagne.
            Il a déjà bu. Beaucoup. Ses yeux sont brillants, mais pas de joie.
            De possessivité.</p>
            
            <p>"C'est magnifique", répond Garance. Elle sourit. Le sourire parfait.
            Celui qu'elle a appris. Pas trop grand. Pas trop petit. Juste assez pour plaire.</p>
            
            <p>Mais ce soir, quelque chose est différent. Marco la regarde trop.
            Trop longtemps. Trop intensément. Il pose sa main sur sa cuisse.
            Elle la déplace doucement. Il la remet.</p>
            
            <p>"Marco..."</p>
            
            <p>"Quoi ?" Sa voix est pâteuse. "Tu es à moi ce week-end, non ?
            J'ai payé. Beaucoup payé."</p>
            
            <p>Garance se raidit. "On avait un accord. Compagnie. Conversation.
            Rien de plus."</p>
            
            <p>Il rit. Un rire sec. "Toutes les femmes disent ça au début.
            Puis elles comprennent. Tout a un prix. Tout."</p>
            
            <p>Le dîner est tendu. Marco boit encore. Parle fort. Raconte des histoires
            où il est toujours le héros. Garance écoute. Hoche la tête. Sourit.
            Mais à l'intérieur, elle a peur. Une peur froide, qui monte.</p>
            
            <p>Minuit. Les autres invités sont partis. Le bateau est calme.
            Juste le bruit des vagues contre la coque. Et la respiration
            lourde de Marco.</p>
            
            <p>"Viens", dit-il en lui prenant la main. "On va dans ma cabine."</p>
            
            <p>Garance hésite. "Je suis fatiguée. Je vais dans ma cabine à moi."</p>
            
            <p>Sa main se serre sur son poignet. "Non. Tu viens avec moi.
            J'ai payé pour toi. Pour tout."</p>
            
            <p>Il l'entraîne. Pas doucement. Elle résiste. "Marco, non.
            Arrête."</p>
            
            <p>Mais il ne l'écoute pas. Il l'attire vers l'escalier qui descend
            aux cabines. Sa poigne est ferme. Douloureuse.</p>
            
            <p>Dans la cabine principale, le luxe est oppressant. Bois précieux.
            Soie. Or. Marco ferme la porte. Tourne la clé.</p>
            
            <p>"Marco, s'il te plaît..."</p>
            
            <p>"Tu es belle", murmure-t-il. Il s'approche. Son haleine sent
            l'alcool et le désir. Un désir dur. Froid.</p>
            
            <p>Il pose ses mains sur ses épaules. Les fait glisser vers le bas.
            Vers le dos de sa robe. Elle se raidit. Tout son corps crie non.</p>
            
            <p>"Non", dit-elle clairement. "Je ne veux pas."</p>
            
            <p>Son visage change. Devient dur. "Tu te moques de moi ?
            J'ai payé dix mille euros. Pour quoi ? Pour regarder tes beaux yeux ?"</p>
            
            <p>"L'accord c'était la compagnie. Rien d'autre."</p>
            
            <p>"L'accord, c'est ce que je décide."</p>
            
            <p>Il l'attire contre lui. Sa bouche cherche la sienne. Elle tourne la tête.
            Ses lèvres se posent sur sa joue. Humides. Froides.</p>
            
            <p>"Laisse-moi !"</p>
            
            <p>Elle essaie de le repousser. Mais il est plus fort. Beaucoup plus fort.
            Et il est en colère maintenant.</p>
            
            <p>"Tu te crois trop bonne ?" Sa voix est devenue méchante.
            "Tu es une pute de luxe, comme les autres. Juste plus chère.
            Alors fais ton travail."</p>
            
            <p>Les mots frappent comme des gifles. Garance sent les larmes monter.
            Mais elle les retient. Elle ne veut pas lui donner ça. Pas ça aussi.</p>
            
            <p>Il la pousse sur le lit. Le grand lit aux draps de soie.
            Elle essaie de se relever. Mais il est déjà sur elle.
            Son poids l'écrase.</p>
            
            <p>"Arrête", répète-t-elle. Plus faiblement.
            "Je t'en supplie."</p>
            
            <p>Il ne répond pas. Ses mains cherchent la fermeture de sa robe.
            Elle se débat. Silencieusement. Comme un animal pris au piège.
            Sans espoir.</p>
            
            <p>Puis... elle cesse de se débattre.
            Son corps devient lourd. Inerte.
            Elle ferme les yeux.
            Se détache.
            S'envole loin.
            Loin de cette cabine.
            Loin de ce yacht.
            Loin de ce corps qu'on lui prend.
            Qu'on lui vole.</p>
            
            <p>Elle se revoit petite fille.
            Dans le jardin de la maison familiale.
            Sa mère lui sourit.
            Le soleil brille.
            Elle est en sécurité.
            Elle est aimée.</p>
            
            <p>Un bruit la ramène à la réalité.
            Le bruit de sa robe qui se déchire.
            Un bruit sec. Comme un cœur qui se brise.</p>
            
            <p>Les larmes coulent enfin.
            Silencieuses.
            Chaudes.
            Humiliantes.</p>
            
            <p>Elle ne regarde pas.
            Ne sent pas.
            N'est plus là.
            Plus vraiment.</p>
            
            <p>Quand c'est fini, Marco se relève.
            Sans un mot.
            Il va à la salle de bain.
            Elle entend couler l'eau.
            Le bruit de la douche.</p>
            
            <p>Elle reste allongée.
            Les yeux ouverts.
            Regardant le plafond en bois précieux.
            Les détails sculptés.
            La beauté qui cache la laideur.</p>
            
            <p>Quand il revient, il est habillé.
            Il jette une serviette sur le lit.
            "Nettoie-toi."</p>
            
            <p>Elle ne bouge pas.
            Ne peut pas bouger.</p>
            
            <p>Il sort une enveloppe de son bureau.
            La pose sur la table de nuit.
            "Dix mille. Pour ta discrétion.
            Et pour oublier."</p>
            
            <p>Puis il sort.
            Ferme la porte.
            La laisse seule.
            Avec sa douleur.
            Sa honte.
            Son corps violé.
            Son âme brisée.</p>
            
            <p>Elle reste longtemps ainsi.
            Immobile.
            Puis elle se lève.
            Avec difficulté.
            Comme si chaque mouvement
            réveillait une nouvelle blessure.</p>
            
            <p>Elle va à la salle de bain.
            Se regarde dans le miroir.
            Une étrangère la regarde.
            Les yeux vides.
            Les lèvres tremblantes.
            La robe déchirée.</p>
            
            <p>Elle ouvre l'eau.
            Très chaude.
            Se lave.
            Longuement.
            Frotte.
            Comme pour enlever une saleté.
            Une souillure.
            Qui ne partira jamais.</p>
            
            <p>Puis elle sort.
            Monte sur le pont.
            La nuit est noire.
            La mer est noire.
            Le ciel est noir.</p>
            
            <p>Elle s'approche du bord.
            Regarde l'eau en dessous.
            Noire. Profonde. Accueillante.</p>
            
            <p>Elle pense à sauter.
            À tout arrêter.
            À disparaître dans le noir.
            Dans le silence.
            Dans l'oubli.</p>
            
            <p>Mais quelque chose la retient.
            Un instinct.
            Une lueur.
            Un "non" minuscule
            au fond d'elle-même.</p>
            
            <p>Elle recule.
            S'assoit sur un banc.
            Tremble.
            De froid.
            De peur.
            De dégoût.</p>
            
            <p>Le soleil se lève.
            Peint le ciel en rose et orange.
            Beauté cruelle.
            Beauté indifférente.</p>
            
            <p>Marco apparaît.
            Il a l'air frais. Reposé.
            Comme si rien ne s'était passé.</p>
            
            <p>"Le petit déjeuner est prêt", dit-il.
            Comme s'ils étaient des amants.
            Comme s'ils avaient partagé
            une nuit d'amour.</p>
            
            <p>Garance le regarde.
            Ne dit rien.
            Que pourrait-elle dire ?
            Les mots n'ont plus de sens.
            Plus de pouvoir.</p>
            
            <p>Elle suit machinalement.
            Mange sans goût.
            Boit sans soif.
            Sourit sans joie.</p>
            
            <p>L'après-midi, il annonce :
            "Je dois partir pour Milan.
            Un avion t'attendra pour Paris demain."</p>
            
            <p>Il lui tend une autre enveloppe.
            "Dix mille de plus.
            Pour ta... coopération."</p>
            
            <p>Elle prend l'argent.
            Sans le regarder.
            Sans le remercier.</p>
            
            <p>Il part.
            Sans un au revoir.
            Sans un regard en arrière.</p>
            
            <p>Garance reste sur le yacht.
            Un jour de plus.
            Seule.
            Avec ses vingt mille euros.
            Et son corps meurtri.
            Et son âme en cendres.</p>
            
            <p>L'argent ne la réchauffe pas.
            Les billets ne sèchent pas ses larmes.
            Le luxe ne répare pas ce qui est brisé.</p>
            
            <p>Elle a vendu beaucoup de choses.
            Son temps.
            Son sourire.
            Son nom.
            Mais ça...
            Ça, elle ne l'avait pas mis en vente.
            Ça, on le lui a pris.
            Volé.
            Détruit.</p>
            
            <p>Et tout l'or du monde
            ne pourra jamais
            racheter
            ce qu'elle a perdu
            cette nuit-là
            sur le yacht de Marco
            dans la baie de Saint-Tropez
            sous les étoiles indifférentes
            qui brillent
            comme des pièces d'or
            dans le ciel noir
            du désespoir.</p> ` },
            9: { title: "Chapitre 9: Alexandre", content:  `<p>De retour à Paris, Garance change. Elle devient plus silencieuse.
            Plus distante. Les soirées avec les hommes riches lui semblent
            plus difficiles. Plus humiliantes.</p>
            
            <p>Elle continue pourtant. Par habitude. Par besoin. L'argent
            doit rentrer. Les dettes doivent être payées. La machine
            doit tourner.</p>
            
            <p>C'est lors d'un dîner avec Karl, l'Allemand, qu'elle rencontre Alexandre.
            Alexandre est serveur au restaurant. Jeune. 25 ans peut-être.
            Pas beau comme les hommes riches. Beau autrement. Des yeux francs.
            Un sourire vrai.</p>
            
            <p>Il sert le vin. Regarde Garance. Pas comme les autres hommes.
            Pas avec désir. Avec curiosité. Comme s'il se demandait :
            "Qu'est-ce qu'une femme comme toi fait avec un homme comme lui ?"</p>
            
            <p>Karl parle de philosophie. De Nietzsche. De la volonté de puissance.
            Garance écoute. Hoche la tête. Mais ses yeux reviennent souvent
            vers Alexandre. Vers ses mains qui versent le vin. Vers son regard
            qui croise le sien, parfois.</p>
            
            <p>À la fin du repas, Karl paie. Donne un pourboire important à Alexandre.
            "Merci, jeune homme."</p>
            
            <p>Puis il part, laissant Garance seule à table. "Je dois prendre
            un appel d'affaires. Rejoins-moi dans la voiture."</p>
            
            <p>Garance reste un moment. Termine son café. Alexandre s'approche.</p>
            
            <p>"Tout allait bien, madame ?"</p>
            
            <p>Elle le regarde. "Oui. Très bien."</p>
            
            <p>Un silence. Puis : "Vous venez souvent ici. Avec... différents messieurs."</p>
            
            <p>Elle rougit. Il a remarqué. Bien sûr qu'il a remarqué.
            Les serveurs voient tout. Savent tout.</p>
            
            <p>"C'est mon travail", dit-elle sèchement.</p>
            
            <p>Il hoche la tête. Pas de jugement dans ses yeux. Juste de la curiosité.
            "Un travail difficile, j'imagine."</p>
            
            <p>Elle se lève. Trop vite. "Je dois y aller."</p>
            
            <p>Mais avant de partir, elle laisse un bout de papier sur la table.
            Avec son numéro. Son vrai numéro. Pas celui qu'elle donne aux clients.</p>
            
            <p>Pourquoi ? Elle ne sait pas. Une impulsion. Un besoin de vérité.
            De quelque chose de vrai dans ce monde de faux-semblants.</p>
            
            <p>Il l'appelle deux jours plus tard. "C'est Alexandre. Du restaurant."</p>
            
            <p>Ils se retrouvent dans un café simple. Pas chic. Pas cher.
            Un café où les étudiants viennent. Où les gens normaux vivent.</p>
            
            <p>Alexandre parle de sa vie. Étudiant en littérature. Serveur le soir.
            Habite un petit studio. Pas d'argent, mais des rêves.</p>
            
            <p>"Je veux écrire", dit-il. "Des romans. Des histoires."</p>
            
            <p>Garance l'écoute. Sourit. Un vrai sourire, cette fois.
            Pas celui des soirées. Celui qui vient du cœur.</p>
            
            <p>"Et toi ?" demande-t-il. "Pourquoi tu fais ça ? Avec ces hommes ?"</p>
            
            <p>Elle hésite. Puis parle. De sa famille. De la maison. Des dettes.
            De la honte. De la nécessité.</p>
            
            <p>Il écoute. Ne juge pas. "C'est dur", dit-il simplement.
            "De vendre des morceaux de soi."</p>
            
            <p>Des morceaux de soi. Oui, c'est ça exactement.
            Chaque soirée, c'est un morceau d'elle qui part.
            Un morceau de son âme.</p>
            
            <p>Ils se revoient. Souvent. Toujours dans des endroits simples.
            Des parcs. Des cafés bon marché. Des rues où personne ne les connaît.</p>
            
            <p>Avec Alexandre, Garance se sent légère. Libre. Elle rit.
            Vraiment. Elle oublie les factures. Les hommes riches.
            Les sourires forcés.</p>
            
            <p>Un soir, il l'embrasse. Doucement. Tendrement.
            Pas comme les autres. Pas avec possession. Avec respect.</p>
            
            <p>Et pour la première fois depuis longtemps, Garance se sent aimée.
            Pas achetée. Pas louée. Aimée.</p>
            
            <p>Mais le bonheur est fragile. Comme du verre.
            Et Garance sait que sa vie est pleine de rochers.
            De rochers pointus, prêts à briser tout ce qui est beau.</p>
            
            <p>Elle commence à mentir à Alexandre aussi.
            "Je vais chez une amie." "Je travaille tard."
            "Je suis fatiguée."</p>
            
            <p>Les mensonges s'accumulent. Comme de la poussière.
            Et un jour, la poussière devient une montagne.
            Une montagne trop haute à escalader.</p>
            
            <p>Mais pour l'instant, elle profite. De ces moments volés.
            De ces baisers doux. De ces regards francs.
            De cette chose précieuse, rare, qu'on appelle l'amour vrai.</p>
            
            <p>Elle sait que ça ne durera pas. Rien de bon ne dure.
            Surtout pas dans sa vie.</p>
            
            <p>Mais pour l'instant, elle ferme les yeux.
            Et elle fait semblant que le monde extérieur n'existe pas.
            Que les hommes riches n'existent pas.
            Que l'argent n'existe pas.</p>
            
            <p>Pour quelques heures, elle n'est pas Garance de Saint-Clair,
            aristocrate déchue, femme à louer.</p>
            
            <p>Elle est juste Garance. Une femme. Qui aime un homme.
            Et qui est aimée en retour.</p>
            
            <p>C'est tout. Et c'est tellement, tellement précieux.</p>
             ` },
            10: { title: "Chapitre 10: Le Secret", content:  ` <p>Les semaines passent. Garance vit deux vies parallèles.
            Deux vies qui se rapprochent de plus en plus.
            Comme deux trains sur la même voie. Une collision est inévitable.
            Elle le sait. Mais elle ne peut pas s'arrêter.</p>
            
            <p>Un matin, elle se réveille avec des nausées. Elle court à la salle de bain.
            Vomit. Pense : "C'est le stress. La fatigue. Rien de plus."</p>
            
            <p>Mais les nausées reviennent. Tous les matins. Et d'autres signes.
            La fatigue extrême. Les seins sensibles. Le retard.</p>
            
            <p>Trois semaines de retard.</p>
            
            <p>Un froid la parcourt. Non. Pas ça. Pas maintenant.</p>
            
            <p>Elle va à la pharmacie. Acheter un test. Elle le cache dans son sac.
            Comme un voleur. Comme une criminelle.</p>
            
            <p>Chez elle, dans la salle de bain trop grande, elle fait le test.
            Les mains qui tremblent. Le cœur qui bat trop vite.</p>
            
            <p>Elle attend. Une minute. Deux. Une éternité.</p>
            
            <p>Puis le résultat apparaît. Deux lignes. Pas une. Deux.</p>
            
            <p>Positif.</p>
            
            <p>Elle s'assoit sur le sol froid. Regarde le test. Incapable de bouger.
            Incapable de penser. Juste ce mot dans sa tête : "Non. Non. Non."</p>
            
            <p>Un bébé. Elle attend un bébé.</p>
            
            <p>Mais de qui ?</p>
            
            <p>Elle fait des calculs dans sa tête. Les dates. Les rendez-vous.
            Les hommes.</p>
            
            <p>Ça pourrait être de Mercier. La dernière fois avec lui, c'était...
            il y a six semaines.</p>
            
            <p>Ça pourrait être de Marco. L'accident à Saint-Tropez. Avant la chute.
            Avant tout.</p>
            
            <p>Ça pourrait être de James. Une soirée où il avait trop bu.
            Où il avait insisté. Où elle avait cédé, par fatigue. Par lassitude.</p>
            
            <p>Ça pourrait être d'Alexandre. Le seul qu'elle aime.
            Le seul qu'elle voulait. Mais aussi le moins probable.
            Ils ont été prudents. Toujours.</p>
            
            <p>Elle ne sait pas. Elle ne saura jamais.</p>
            
            <p>La panique monte. Une panique noire, épaisse. Qui étouffe.</p>
            
            <p>Que faire ?</p>
            
            <p>Dire à Alexandre ? Mais s'il n'est pas le père ?
            Il la quittera. Elle le sait. Personne n'accepterait ça.</p>
            
            <p>Dire aux hommes riches ? Ils paieront pour un avortement.
            Ou pour un silence. De l'argent, toujours de l'argent.
            Mais pas de responsabilité. Jamais.</p>
            
            <p>Garder le bébé ? Seule ? Sans argent ? Avec toutes les dettes ?
            Impossible.</p>
            
            <p>Elle pleure. Assise sur le sol de la salle de bain.
            Elle pleure toutes les larmes de son corps.
            Toute la peine. Toute la honte. Tout le désespoir.</p>
            
            <p>Édouard frappe à la porte. "Mademoiselle ? Tout va bien ?"</p>
            
            <p>"Oui", dit-elle d'une voix étranglée. "Tout va bien."</p>
            
            <p>Mais rien ne va bien. Plus rien.</p>
            
            <p>Elle se relève. Regarde son reflet dans le miroir.
            Pâle. Les yeux rouges. Les cheveux en désordre.</p>
            
            <p>Et son ventre. Encore plat. Mais pas pour longtemps.
            Dans quelques semaines, tout le monde verra.
            Tout le monde saura.</p>
            
            <p>Elle doit prendre une décision. Vite.</p>
            
            <p>Mais chaque option est pire que la précédente.
            Chaque chemin mène à la souffrance.</p>
            
            <p>Elle pense à sa mère. Morte trop jeune.
            Elle pense à son arrière-grand-mère. Si sévère.
            Elle pense à toutes les femmes de sa famille.
            Toutes celles qui ont fait des choix difficiles.
            Pour survivre. Pour continuer.</p>
            
            <p>Elle n'est pas la première. Elle ne sera pas la dernière.</p>
            
            <p>Elle range le test dans un tiroir. Sous des serviettes.
            Cache la preuve. Cache la vérité.</p>
            
            <p>Puis elle se maquille. Se coiffe. Met une robe élégante.
            Se regarde dans le miroir.</p>
            
            <p>La femme dans le miroir est parfaite. Belle. Contrôlée.
            Rien ne transparaît. Rien ne laisse deviner le chaos à l'intérieur.</p>
            
            <p>C'est ça, son talent. Son don. Savoir cacher.
            Savoir sourire quand on veut crier.
            Savoir paraître calme quand on veut mourir.</p>
            
            <p>Elle sort de la salle de bain. Descend l'escalier.
            Édouard l'attend en bas.</p>
            
            <p>"La voiture est là, mademoiselle. Pour votre rendez-vous avec monsieur Mercier."</p>
            
            <p>Mercier. Encore lui. Toujours lui.</p>
            
            <p>"Merci, Édouard."</p>
            
            <p>Elle sort. Monte dans la voiture. Regarde par la fenêtre.
            Paris défile. La vie continue. Insensible à son drame.</p>
            
            <p>Sa main se pose sur son ventre. Doucement.
            Un geste instinctif. Maternelle.</p>
            
            <p>Un bébé. Il y a un bébé en elle.</p>
            
            <p>Et elle doit décider de son sort.
            Comme elle a décidé du sien.
            Comme elle décide de tout, depuis toujours.</p>
            
            <p>Mais cette fois, la décision est trop lourde.
            Trop importante.</p>
            
            <p>Cette fois, ce n'est pas seulement sa vie qu'elle joue.
            C'est une autre vie. Une vie innocente.
            Qui n'a rien demandé.</p>
            
            <p>La voiture s'arrête devant le restaurant.
            Le chauffeur ouvre la porte.</p>
            
            <p>Garance respire profondément. Met son sourire.
            Le sourire de la femme à louer.
            La femme qui coûte cher.
            La femme qui a un secret trop lourd à porter.</p>
            
            <p>Elle sort. Avance vers le restaurant.
            Vers Mercier. Vers l'argent. Vers la honte.</p>
            
            <p>Et quelque part, très profond en elle,
            le bébé grandit.
            Inconscient du monde qui l'attend.
            Un monde d'or et de larmes.
            Un monde où tout se vend.
            Même l'amour.
            Même la vie.</p>
            ` },
            11: { title: "Chapitre 11:Le Mensonge Qui Grandit", content:  `<p>Le temps passe. Chaque jour, le secret grandit. Comme son ventre.
            Garance apprend à cacher. À mentir. À inventer.</p>
            
            <p>Avec les hommes riches, elle porte des robes amples. Des ceintures larges.
            Des écharpes qu'elle laisse tomber négligemment sur son ventre.
            Elle refuse les alcools. "Un régime", dit-elle. "Le médecin m'a dit de faire attention."</p>
            
            <p>Mercier la regarde, soupçonneux. "Tu as pris un peu de poids, ma chère."</p>
            
            <p>"Le stress", répond-elle vite. "Les problèmes familiaux."</p>
            
            <p>Il hoche la tête. Croit ou ne croit pas. Peu importe. Tant qu'elle reste belle.
            Tant qu'elle fait bonne figure à ses côtés.</p>
            
            <p>Avec Alexandre, c'est plus difficile. Il la voit plus souvent. Il la touche.
            Il l'aime. Et l'amour voit ce que l'argent ne voit pas.</p>
            
            <p>"Tu es fatiguée", dit-il un soir. Ils sont dans son petit studio.
            Sur le lit étroit. "Trop fatiguée."</p>
            
            <p>"C'est le travail", murmure-t-elle. "La galerie m'épuise."</p>
            
            <p>Elle a inventé un travail. Une galerie d'art où elle serait "conseillère".
            Un travail respectable. Un travail qui justifie les robes chères.
            Les soirées. Les absences.</p>
            
            <p>Alexandre ne sait pas qu'elle ment. Il croit en elle.
            Et chaque mensonge est un couteau dans le cœur de Garance.
            Mais elle continue. Parce qu'elle doit continuer.</p>
            
            <p>Deux mois passent. Son ventre s'arrondit. Elle ne peut plus le cacher
            avec des vêtements. Elle achète des corsets. Des gaines serrées.
            Qui lui coupent la respiration. Qui font mal au bébé, peut-être.
            Mais elle n'a pas le choix.</p>
            
            <p>Un après-midi, chez Sofia. Le salon de thé chic. Sofia la regarde.
            Longuement. Trop longuement.</p>
            
            <p>"Garance." Sa voix est basse. sérieuse. "Dis-moi la vérité."</p>
            
            <p>Garance baisse les yeux. Joue avec sa cuillère. "De quoi parles-tu ?"</p>
            
            <p>"Ne fais pas l'idiote. Je sais reconnaître les signes. J'ai une sœur
            qui a eu trois enfants."</p>
            
            <p>Un silence. Puis : "Oui."</p>
            
            <p>Sofia ne semble pas surprise. "De qui ?"</p>
            
            <p>"Je ne sais pas."</p>
            
            <p>Cette fois, Sofia sursaute. "Comment ça, tu ne sais pas ?"</p>
            
            <p>Garance explique. Rapidement. Les hommes. Les dates. L'incertitude.
            Sofia écoute. Son visage se ferme.</p>
            
            <p>"Idiote", dit-elle enfin. Pas méchamment. Juste fatiguée.
            "Tu sais ce qu'il faut faire. Avorter. Vite. Avant qu'il ne soit trop tard."</p>
            
            <p>"Je ne peux pas."</p>
            
            <p>"Pourquoi ? Par principe ? Par religion ?" Sofia rit, amer.
            "Dans notre monde, les principes sont un luxe. Un luxe que tu ne peux pas t'offrir."</p>
            
            <p>"Ce n'est pas ça. C'est... je ne peux pas."</p>
            
            <p>Elle ne sait pas expliquer. Une partie d'elle veut ce bébé.
            Même si c'est une erreur. Même si c'est un désastre.
            Ce bébé est à elle. La seule chose vraie dans sa vie de mensonges.</p>
            
            <p>"Bon." Sofia soupire. "Alors il faut agir. Dire aux hommes.
            Voir qui accepte. Qui paie. Qui prend ses responsabilités."</p>
            
            <p>"Ils ne prendront pas leurs responsabilités. Ils paieront, oui.
            Pour que je me taise. Pour que j'disparaisse."</p>
            
            <p>"Alors prends l'argent. Et disparais. Va ailleurs.
            Recommence. C'est ce que je ferais."</p>
            
            <p>Mais Garance ne peut pas disparaître. Il y a la maison.
            Les dettes. Édouard. Alexandre.</p>
            
            <p>Alexandre. Son nom est une douleur dans sa poitrine.</p>
            
            <p>"Il y a Alexandre", murmure-t-elle.</p>
            
            <p>Sofia la regarde, incrédule. "Le serveur ? Tu es sérieuse ?
            Tu risques tout pour un serveur ?"</p>
            
            <p>"Je l'aime."</p>
            
            <p>Les mots sortent. Simples. Vrais. Pour une fois.</p>
            
            <p>Sofia secoue la tête. "L'amour ne paie pas les factures, ma chère.
            L'amour ne sauve pas les maisons. L'amour... l'amour est un luxe.
            Comme les principes."</p>
            
            <p>Elle se lève. Jette de l'argent sur la table. "Réfléchis.
            Et agis vite. Avant que ton ventre ne parle pour toi."</p>
            
            <p>Elle part. Laisse Garance seule. Avec son thé froid.
            Et son ventre qui grandit.
            Et son cœur qui se déchire.</p>
            
            <p>Ce soir-là, rendez-vous avec James. Le restaurant chic.
            Garance a mis la gaine la plus serrée. Elle a du mal à respirer.
            À chaque mouvement, la douleur. Comme si le bébé protestait.
            Comme s'il disait : "Laisse-moi vivre. Laisse-moi exister."</p>
            
            <p>James commande. Boit. Parle de ses nouvelles acquisitions.
            Une île. Une galerie d'art. Une femme ? Peut-être.</p>
            
            <p>À la fin du repas, il pose une question. "Tu veux venir chez moi ce soir ?
            J'ai acheté un nouvel appartement. Vue sur la tour Eiffel."</p>
            
            <p>Avant, elle aurait dit oui. Pour l'argent. Pour la tradition.
            Mais maintenant... maintenant elle a un bébé à protéger.</p>
            
            <p>"Je ne peux pas", dit-elle. "Je ne me sens pas bien."</p>
            
            <p>Son visage change. Devient dur. "Ça fait trois fois que tu refuses.
            Tu te moques de moi ?"</p>
            
            <p>"Non, James. Vraiment. Je suis malade."</p>
            
            <p>Il sort une enveloppe. La pose sur la table. Moins épaisse que d'habitude.
            "Voilà pour ce soir. Et ne m'appelle plus. Je trouve quelqu'un d'autre.
            Quelqu'un de plus... coopératif."</p>
            
            <p>Il part. Sans un regard en arrière.
            Garance reste à table. Regarde l'enveloppe.
            Le premier client perdu.</p>
            
            <p>Ce n'est que le début, elle le sait.
            Bientôt, ce sera Mercier. Puis Karl.
            Puis tous.</p>
            
            <p>Et elle se retrouvera seule.
            Enceinte.
            Sans argent.</p>
            
            <p>Elle pose une main sur son ventre.
            Sous la table. Où personne ne peut voir.</p>
            
            <p>"Pardonne-moi", murmure-t-elle.
            À son bébé. À elle-même. À tous ceux qu'elle a trahis.</p>
            
            <p>"Pardonne-moi de ne pas être plus forte.
            Pardonne-moi de ne pas savoir comment faire."</p>
            
            <p>Le serveur apporte l'addition. Elle paie.
            Avec l'argent de James.
            L'argent qui diminue.
            Comme ses espoirs.
            Comme son temps.</p>
            
            <p>Dehors, la nuit est fraîche.
            Garance marche vers la voiture qui l'attend.
            Chaque pas est lourd.
            Comme si elle portait déjà le poids
            de toutes ses mauvaises décisions.
            De tous ses mensonges.
            De toute sa vie ratée.</p>
            
            <p>Et quelque part, dans son ventre,
            un petit cœur bat.
            Innocent.
            Ignorant.
            Espérant.</p>
            
            <p>Espérant une vie meilleure
            que celle que sa mère lui prépare.</p>
             ` },
            12: { title: "Chapitre 12: Le Chantage", content: ` <p>La photo arrive par courrier. Sans avertissement. Sans explication.
            Juste une photo dans une enveloppe blanche.</p>
            
            <p>Garance l'ouvre à la cuisine. Son café à la main.
            Et le monde s'arrête.</p>
            
            <p>Sur la photo : elle et Marco. Sur le yacht à Saint-Tropez.
            La veille de l'accident. Elle porte un bikini. Il a le bras
            autour de sa taille. Ils sourient. Ils ont l'air heureux.
            Amoureux, même.</p>
            
            <p>Au dos de la photo, écrit à la main : "30 000€. Sinon,
            je vends aux journaux. 'Aristocrate déchue, maîtresse
            de milliardaire marié.' Tu as 48 heures."</p>
            
            <p>Un numéro de téléphone. Rien d'autre.</p>
            
            <p>Garance laisse tomber la photo. Ses mains tremblent.
            Son café se renverse sur la table. Tache brune.
            Comme du sang.</p>
            
            <p>Trente mille euros. Elle n'a pas trente mille euros.
            Plus maintenant. James ne paie plus. Les autres paient moins.
            Et les dettes augmentent.</p>
            
            <p>Elle appelle le numéro. Une voix d'homme. Jeune. Froid.
            "Vous avez la photo ?"</p>
            
            <p>"Oui. Qui êtes-vous ?"</p>
            
            <p>"Peu importe. Vous avez l'argent ?"</p>
            
            <p>"Je... je ne peux pas. Pas maintenant."</p>
            
            <p>Un rire sec. "Alors préparez-vous. Les journaux vont adorer.
            Fille de bonne famille. Vieille noblesse. Et... putain de luxe.
            C'est vendeur."</p>
            
            <p>"S'il vous plaît..."</p>
            
            <p>"Trente mille. 48 heures. Pas de négociation."</p>
            
            <p>Il raccroche. Garance reste avec le téléphone à l'oreille.
            La tonalité. Bip. Bip. Bip. Comme un compte à rebours.
            Comme sa vie qui s'écroule.</p>
            
            <p>Elle essaie de réfléchir. Qui a pris la photo ?
            Un membre d'équipage ? Un autre invité ? Un paparazzi en bateau ?</p>
            
            <p>Peu importe. La photo existe. La preuve existe.</p>
            
            <p>Si elle paraît dans les journaux... Sa tante Hélène verra.
            Ses amis verront. Alexandre verra.</p>
            
            <p>Alexandre.</p>
            
            <p>Son cœur se serre. Il ne sait rien. Rien de Marco.
            Rien des autres. Rien de sa vraie vie.</p>
            
            <p>Si il découvre comme ça... dans un journal...
            Ce sera fini. Vraiment fini.</p>
            
            <p>Elle doit trouver l'argent. Vite.</p>
            
            <p>Elle appelle Mercier. "Antoine... j'ai un problème.
            J'ai besoin d'argent. Beaucoup d'argent."</p>
            
            <p>"Quel genre de problème ?" Sa voix est méfiante.</p>
            
            <p>"Personnel. Familial. Une dette urgente."</p>
            
            <p>Un silence. Puis : "Combien ?"</p>
            
            <p>"Trente mille."</p>
            
            <p>Il siffle. "Beaucoup. Même pour moi. Qu'est-ce que j'ai en échange ?"</p>
            
            <p>Elle ferme les yeux. "Ce que tu veux."</p>
            
            <p>Un autre silence. Plus long. "D'accord. Mais ce sera la dernière fois.
            Et tu signes un papier. Pour dire que c'est un prêt. Avec intérêts."</p>
            
            <p>Un prêt. Encore une dette. Une dette de plus.</p>
            
            <p>"D'accord."</p>
            
            <p>Il envoie l'argent. Par virement. Rapide. Efficace.
            Comme toujours.</p>
            
            <p>Garance paie le chantageur. L'homme vient chercher l'argent
            dans un café. Il est jeune. Banale. On ne le remarquerait pas.
            C'est peut-être pour ça qu'il est bon dans son métier.</p>
            
            <p>"Les négatifs ?" demande Garance.</p>
            
            <p>"Il n'y a pas de négatifs. C'est numérique." Il sourit.
            Un sourire qui fait froid. "Mais j'ai tout effacé. Promis."</p>
            
            <p>Elle ne le croit pas. Mais que peut-elle faire ?
            Rien. Comme toujours.</p>
            
            <p>Il part. Avec son argent. Son argent volé.
            Son argent gagné avec tant de honte.</p>
            
            <p>Garance reste au café. Regarde les gens autour.
            Ils rient. Ils parlent. Ils vivent.
            Ils n'ont pas de chantage. Pas de dettes. Pas de ventre qui grossit.
            Pas de vie secrète.</p>
            
            <p>Elle les envie. Terriblement.</p>
            
            <p>Son téléphone sonne. C'est Alexandre.
            "Salut. Tu viens ce soir ? J'ai fait à manger."</p>
            
            <p>Sa voix est chaude. Heureuse. Innocente.</p>
            
            <p>Garance sent des larmes monter. "Oui. Je viens."</p>
            
            <p>"Super ! Je t'aime."</p>
            
            <p>"Moi aussi."</p>
            
            <p>Elle raccroche. Pleure. Doucement. Dans le café.
            Personne ne remarque. Personne ne voit.
            Elle est invisible. Comme toujours.</p>
            
            <p>Le soir, chez Alexandre. Le petit studio est chaleureux.
            Il a cuisiné. Pas bien. Mais avec amour.</p>
            
            <p>Ils mangent. Parlent. Rient.
            Garance oublie. Pour quelques heures.
            Elle oublie le chantage. Les dettes. Les hommes.
            Elle oublie tout.</p>
            
            <p>Puis Alexandre pose une main sur son ventre.
            Doucement. "Tu as grossi", dit-il en souriant.
            "C'est mignon."</p>
            
            <p>Elle se fige. "Oui. Le stress. Je mange trop."</p>
            
            <p>Mais il continue. Sa main caresse son ventre.
            Et soudain... un mouvement.</p>
            
            <p>Un petit coup. Faible. Mais là.</p>
            
            <p>Alexandre sursaute. "Qu'est-ce que c'était ?"</p>
            
            <p>"Rien. Des gaz. Désolée."</p>
            
            <p>Elle se lève. Va à la cuisine. Cache son visage.
            Son cœur bat à tout rompre.</p>
            
            <p>Le bébé a bougé. Pour la première fois.
            Et c'est Alexandre qui l'a senti.
            Alexandre, qui n'est peut-être pas le père.
            Alexandre, qu'elle trompe depuis le début.</p>
            
            <p>La honte est un goût de métal dans sa bouche.
            Amer. Poison.</p>
            
            <p>Elle revient. Sourit. "Je suis fatiguée. Je dois rentrer."</p>
            
            <p>Alexandre la regarde. Ses yeux cherchent les siens.
            "Tu me caches quelque chose, Garance."</p>
            
            <p>"Non. Rien."</p>
            
            <p>"Si. Je le sens. Depuis des semaines. Tu es distante.
            Tu changes. Qu'est-ce qui se passe ?"</p>
            
            <p>Elle veut tout dire. Tout avouer. Les larmes. La honte.
            La peur. Le bébé. Tout.</p>
            
            <p>Mais les mots ne sortent pas. Ils restent coincés.
            Dans sa gorge. Dans son cœur brisé.</p>
            
            <p>"Rien, Alexandre. Vraiment. Juste... la fatigue."</p>
            
            <p>Elle l'embrasse. Un baiser rapide. Puis part.
            Descend les escaliers en courant.
            Comme si les démons la poursuivaient.</p>
            
            <p>Dehors, elle s'arrête. Respire. Le froid lui brûle les poumons.</p>
            
            <p>Dans son ventre, le bébé bouge encore.
            Comme s'il cherchait la main d'Alexandre.
            Comme s'il voulait dire : "Papa ? C'est toi ?"</p>
            
            <p>Et Garance pleure. Dans la rue froide.
            Seule.
            Perdue.
            Prisonnière de ses propres mensonges.</p>
            
            <p>Et elle sait. Elle sait que tout va s'écrouler.
            Bientôt.
            Très bientôt.</p>
            
            <p>Il ne reste plus beaucoup de temps.
            Plus beaucoup de mensonges possibles.</p>
            
            <p>La vérité va éclater.
            Comme une bombe.
            Et tout va être détruit.
            Tout ce qui lui reste.
            Tout ce qu'elle aime.</p>
            
            <p>Tout.</p>
            ` },
            13: { title: "Chapitre 13: La Vérité Éclate", content:  ` <p>La pluie tombait sur Paris. Une pluie fine, froide, persistante.
            Garance marchait vers l'appartement d'Alexandre. Son ventre, maintenant
            impossible à cacher, était lourd. Cinq mois. Le temps passait trop vite.</p>
            
            <p>Elle avait décidé de tout lui dire. Ce soir. Maintenant.
            Plus de mensonges. Plus de cachotteries. La vérité, toute la vérité.
            Même si ça devait le faire partir. Même si ça devait tout détruire.</p>
            
            <p>Elle frappa à la porte. Alexandre ouvrit. Son sourire s'effaça
            en la voyant. "Garance... qu'est-ce qui se passe ? Tu es toute pâle."</p>
            
            <p>"On peut entrer ? Il faut que je te parle."</p>
            
            <p>Dans le studio, tout était comme d'habitude. Les livres empilés.
            Les assiettes pas lavées. L'odeur de café et de cigarettes.
            L'odeur d'Alexandre. L'odeur du bonheur simple qu'elle allait perdre.</p>
            
            <p>"Assieds-toi", dit-il. Il semblait inquiet. "Tu veux un thé ?"</p>
            
            <p>"Non. Merci."</p>
            
            <p>Elle s'assit sur le lit. Les mains sur son ventre. Pour se donner du courage.
            "Alexandre... il y a quelque chose que je dois te dire. Quelque chose
            de très important."</p>
            
            <p>Il s'assit en face d'elle. Sur la chaise. Attentif. "Je t'écoute."</p>
            
            <p>Les mots ne voulaient pas sortir. Ils étaient coincés dans sa gorge.
            Comme des pierres. Lourdes. Douloureuses.</p>
            
            <p>"Je... je suis enceinte."</p>
            
            <p>Un silence. Puis un sourire. Hésitant. "C'est... c'est une bonne nouvelle ?
            Tu es contente ?"</p>
            
            <p>"Je suis enceinte de cinq mois."</p>
            
            <p>Son sourire disparut. "Cinq mois ? Mais... tu ne m'as rien dit.
            Pourquoi ?"</p>
            
            <p>"Parce que..." Elle ferma les yeux. "Parce que je ne suis pas sûre
            que ce soit ton enfant."</p>
            
            <p>Le silence qui suivit fut le plus terrible qu'elle ait jamais connu.
            Un silence épais, lourd, qui pesait sur toute la pièce.
            Un silence qui faisait mal.</p>
            
            <p>Quand elle rouvrit les yeux, Alexandre était devenu très pâle.
            "Qu'est-ce que tu dis ?" Sa voix était basse. Étranglée.</p>
            
            <p>"Je ne suis pas celle que tu crois, Alexandre. Mon travail... ce n'est pas
            dans une galerie d'art. Je... je suis payée pour accompagner des hommes riches.
            Pour être à leurs côtés lors de soirées. Pour... pour faire joli."</p>
            
            <p>Elle parlait vite maintenant. Comme si elle voulait tout sortir d'un coup.
            Comme si elle voulait se purger de tous ses mensonges.</p>
            
            <p>"Il y a plusieurs hommes. Antoine Mercier. Karl. James. Marco.
            Et avec certains... avec certains, c'est allé plus loin que juste
            de la compagnie. Je ne voulais pas toujours. Mais... l'argent...
            J'avais besoin d'argent."</p>
            
            <p>Alexandre ne bougeait pas. Ne parlait pas. Il la regardait comme
            s'il ne la reconnaissait pas. Comme si une étrangère était assise
            sur son lit.</p>
            
            <p>"Le bébé...", continua-t-elle, les larmes aux yeux maintenant.
            "Il pourrait être de l'un d'eux. Je ne sais pas. Les dates...
            c'est compliqué. Ça pourrait être toi. Mais je ne peux pas te le promettre."</p>
            
            <p>Elle attendit. Une réponse. Une réaction. N'importe quoi.</p>
            
            <p>Rien.</p>
            
            <p>Juste ce regard. Ce regard qui la traversait. Qui voyait enfin
            la vraie Garance. Celle qui vendait des morceaux d'elle-même.
            Celle qui mentait. Celle qui trompait.</p>
            
            <p>Quand il parla enfin, sa voix était froide. Étrange.
            "Depuis combien de temps ?"</p>
            
            <p>"Un an. Un peu plus."</p>
            
            <p>"Et pendant tout ce temps... pendant que je te croyais...
            pendant que je pensais que tu m'aimais..."</p>
            
            <p>"Je t'aime !" Le cri sortit de sa poitrine. Vrai. Désespéré.
            "Je t'aime, Alexandre. C'est pour ça que c'est si dur. C'est pour ça
            que je te dis tout maintenant. Parce que je t'aime. Vraiment."</p>
            
            <p>Il se leva. Tourna le dos. Regarda par la fenêtre.
            La pluie qui coulait sur les carreaux. Comme des larmes.</p>
            
            <p>"Tu crois que l'amour excuse tout ?" demanda-t-il sans se retourner.
            "Tu crois que dire 'je t'aime' efface les mensonges ? Les trahisons ?"</p>
            
            <p>"Non. Mais... c'est la vérité. Je t'aime. Toi. Pas eux. Jamais eux."</p>
            
            <p>Il se retourna. Son visage était dur. Transformé par la douleur.
            "Et l'argent ? Tu aimes l'argent aussi, non ? Sinon, tu n'aurais pas fait ça."</p>
            
            <p>"J'avais besoin d'argent ! Pour ma maison ! Pour mes dettes !
            Tu ne comprends pas la pression !"</p>
            
            <p>"Je comprends la pression !" cria-t-il soudain. "Je comprends
            de ne pas avoir d'argent ! Je travaille comme serveur tous les soirs !
            J'étudie le jour ! Je vis dans 20 mètres carrés ! Mais je ne vends pas mon corps !
            Je ne mens pas à ceux que j'aime !"</p>
            
            <p>Les mots frappèrent comme des gifles. Garance baissa la tête.
            Les larmes coulaient maintenant. Chaudes. Salées. Honteuses.</p>
            
            <p>"Je suis désolée", murmura-t-elle. "Je suis tellement désolée."</p>
            
            <p>Alexandre vint s'asseoir près d'elle. Pas pour la consoler.
            Pour regarder son ventre. Ce ventre qui contenait peut-être son enfant.
            Ou peut-être celui d'un autre homme.</p>
            
            <p>"Qu'est-ce que tu veux faire ?" demanda-t-il. Plus calmement.
            Mais toujours froid. Distant.</p>
            
            <p>"Je ne sais pas. Garder le bébé. Essayer de... de recommencer."</p>
            
            <p>"Sans argent ?"</p>
            
            <p>"Je trouverai. Je travaillerai. Vraiment travailler.
            Pas comme avant."</p>
            
            <p>Il hocha la tête. Lentement. Comme s'il pesait chaque mot.
            "Garance... je ne peux pas. Je ne peux pas faire comme si
            rien ne s'était passé. Je ne peux pas élever un enfant
            qui n'est peut-être pas le mien. Je ne peux pas... te faire confiance."</p>
            
            <p>Elle le savait. Elle l'avait toujours su. Mais entendre les mots...
            c'était pire que tout. C'était la fin. La vraie fin.</p>
            
            <p>"Je comprends", dit-elle dans un souffle.</p>
            
            <p>Il prit sa main. Une dernière fois. "Je t'aimais, Garance.
            Vraiment. Je pensais que tu étais... différente. Que tu étais vraie."</p>
            
            <p>"Je suis vraie maintenant."</p>
            
            <p>"Trop tard."</p>
            
            <p>Deux mots. Deux petits mots. Mais ils contenaient toute la douleur
            du monde. Toute la tristesse de ce qui aurait pu être.
            De ce qui ne serait jamais.</p>
            
            <p>Elle se leva. La main toujours sur son ventre.
            "Au revoir, Alexandre."</p>
            
            <p>Il ne répondit pas. Juste un hochement de tête.
            Les yeux ailleurs. Déjà loin.</p>
            
            <p>Elle sortit. Descendit les escaliers.
            La pluie l'attendait dehors. Froide. Indifférente.</p>
            
            <p>Elle marcha. Sans but. Laissant la pluie la tremper.
            Laissant le froid la pénétrer.</p>
            
            <p>Alexandre était parti. Le dernier morceau de bonheur.
            Le dernier espoir.</p>
            
            <p>Il ne restait plus que le bébé. Et les dettes.
            Et la honte.</p>
            
            <p>Elle s'arrêta sous un porche. S'appuya contre le mur froid.
            La main sur son ventre.</p>
            
            <p>Le bébé bougea. Un petit coup. Faible.
            Comme s'il sentait sa détresse.
            Comme s'il voulait dire : "Je suis là. Ne sois pas seule."</p>
            
            <p>Garance pleura. Des sanglots silencieux qui la secouaient tout entière.
            Des sanglots pour tout ce qu'elle avait perdu.
            Pour tout ce qu'elle avait gâché.
            Pour tout ce qui était brisé et ne pourrait jamais être réparé.</p>
            
            <p>La pluie continuait. Implacable.
            Comme la vie.
            Comme les conséquences de ses choix.</p>
            
            <p>Elle avait tout perdu.
            L'amour.
            La dignité.
            L'espoir.</p>
            
            <p>Il ne restait plus qu'à attendre la suite.
            La chute finale.
            Le fond du trou.</p>
            
            <p>Et elle savait qu'elle y arriverait bientôt.
            Très bientôt.</p>
            
            <p>Parce que quand on a tout perdu,
            il n'y a plus qu'une direction possible :
            le bas.
            Toujours plus bas.</p>
            
            <p>Jusqu'à ce qu'il n'y ait plus rien à perdre.
            Plus rien du tout.</p>
            ` },
            14: { title: "Chapitre 14: La Fin des Illusions", content:  ` <p>Une semaine après la rupture avec Alexandre, Garance reçut un appel d'Antoine Mercier.
            Sa voix était polie, comme toujours. Mais froide. Professionnelle.</p>
            
            <p>"Garance, nous devons parler. Pouvez-vous passer à mon bureau demain ?"</p>
            
            <p>"Bien sûr. À quelle heure ?"</p>
            
            <p>"Onze heures. Et... venez seule."</p>
            
            <p>Le lendemain, Garance mit une robe ample. Une des dernières qu'elle pouvait encore porter.
            Elle se regarda dans le miroir. Son ventre était maintenant visible, même sous les vêtements amples.
            Son visage était pâle, ses yeux cernés. Elle avait l'air de ce qu'elle était : une femme en détresse.</p>
            
            <p>Le bureau de Mercier était dans le 8ème arrondissement. Luxueux, discret.
            Un lieu de pouvoir. L'antre d'un homme qui contrôlait tout. Y compris elle.</p>
            
            <p>La secrétaire la fit entrer. Mercier était debout près de la fenêtre.
            Il se retourna. Son regard tomba immédiatement sur son ventre.</p>
            
            <p>"Asseyez-vous", dit-il, sans salutation.</p>
            
            <p>Elle s'assit. Les mains sur les genoux. Tremblantes.</p>
            
            <p>"Je vais être direct", commença-t-il. "Votre... situation est devenue problématique.
            Je ne peux plus vous présenter dans les cercles que je fréquente.
            Les apparences sont importantes, vous le savez."</p>
            
            <p>"Antoine... je peux expliquer..."</p>
            
            <p>"Inutile." Il leva une main. "Je sais tout. Ou du moins, je sais l'essentiel.
            Vous êtes enceinte. Vous ne savez pas de qui. Et vous continuez à vous présenter
            comme une femme libre, disponible. C'est... indécent."</p>
            
            <p>Le mot frappa comme une gifle. Indécent. C'était elle qui était indécente.
            Pas lui, qui payait pour la compagnie de femmes plus jeunes.
            Pas lui, qui profitait de la détresse des autres.</p>
            
            <p>"Je vous ai apporté beaucoup", dit-elle, la voix tremblante. "Je vous ai représenté
            avec dignité. Avec classe."</p>
            
            <p>"Oui. Et vous avez été payée pour ça. Très bien payée. Mais le contrat
            est terminé. Voici."</p>
            
            <p>Il poussa une enveloppe sur le bureau. "Cinq mille euros. Une prime de départ.
            Et un conseil : disparaissez. Allez ailleurs. Recommencez."</p>
            
            <p>Cinq mille euros. Pour un an de sa vie. Pour des morceaux de son âme.
            Cinq mille euros pour dire au revoir.</p>
            
            <p>"Et mes dettes ?" demanda-t-elle. "Le prêt que vous m'avez fait..."</p>
            
            <p>"Dois-je rappeler les huissiers ?" Sa voix était douce. Menaçante.
            "Je pense que non. Prenons cela comme... réglé. Mais à une condition :
            je ne veux plus jamais vous voir. Ni vous entendre. Vous disparaissez
            de ma vie. Compris ?"</p>
            
            <p>Elle hocha la tête. Incapable de parler.</p>
            
            <p>"Bon." Il se leva. La réunion était terminée. "La secrétaire vous montrera la sortie.
            Et Garance... bon courage. Vous en aurez besoin."</p>
            
            <p>Il ne la regarda même pas quand elle sortit.
            Elle n'était plus rien. Plus une employée. Plus un atout.
            Juste un problème à régler. Et il l'avait réglé.</p>
            
            <p>Dehors, le soleil brillait. Ironique.
            Garance marcha jusqu'au parc Monceau. S'assit sur un banc.
            Ouvrit l'enveloppe.</p>
            
            <p>Cinq mille euros. Pas beaucoup. Assez pour quelques mois de loyer.
            Pas assez pour sauver la maison. Pas assez pour élever un enfant.</p>
            
            <p>Son téléphone sonna. Karl. L'Allemand.
            "Garance, ma chère. J'ai entendu des rumeurs. Est-ce vrai ?
            Vous attendez un enfant ?"</p>
            
            <p>"Oui, c'est vrai."</p>
            
            <p>Un silence. Puis : "Je vois. Alors je pense qu'il est préférable
            que nous arrêtions nos rencontres. Je vous souhaite bonne chance."</p>
            
            <p>Click.</p>
            
            <p>Un autre. Effacé de sa vie. Comme ça.
            Sans regret. Sans émotion.</p>
            
            <p>Les appels continuèrent toute la journée.
            James. D'autres hommes qu'elle avait vus une ou deux fois.
            Tous polis. Tous froids. Tous définitifs.</p>
            
            <p>À la fin de la journée, elle n'avait plus de clients.
            Plus de revenus.
            Plus rien.</p>
            
            <p>Elle rentra chez elle. Édouard l'attendait dans le hall.
            Son visage était grave.</p>
            
            <p>"Mademoiselle... une lettre. Des huissiers."</p>
            
            <p>Elle prit la lettre. Les mains tremblantes.
            La saisie. La maison serait saisie dans un mois.
            Ses dettes étaient trop importantes. Les paiements
            trop irréguliers.</p>
            
            <p>"Je suis désolée, Édouard."</p>
            
            <p>Il baissa la tête. "Je comprends. Je... je vais devoir chercher
            un autre emploi. Après toutes ces années..."</p>
            
            <p>"Je sais. Je suis désolée."</p>
            
            <p>Elle monta dans sa chambre. S'allongea sur le lit.
            Regarda le plafond.</p>
            
            <p>Tout était fini.
            Les hommes.
            L'argent.
            La maison.
            Alexandre.</p>
            
            <p>Il ne restait que le bébé.
            Et la solitude.
            Et la peur.</p>
            
            <p>Elle posa les mains sur son ventre.
            Sentit le bébé bouger.
            Une petite vie qui dépendait d'elle.
            Une petite vie qu'elle ne savait pas comment protéger.
            Comment nourrir.
            Comment aimer.</p>
            
            <p>"Que vais-je faire ?" murmura-t-elle.
            À personne. À elle-même.
            Au bébé qui ne pouvait pas répondre.</p>
            
            <p>La nuit tomba. La maison devint silencieuse.
            Trop silencieuse.
            Comme un tombeau.
            Comme sa vie.</p>
            
            <p>Elle se leva. Alla à la fenêtre.
            Regarda Paris qui brillait.
            Des millions de lumières.
            Des millions de vies.
            Et la sienne, si sombre.
            Si seule.</p>
            
            <p>Elle pensa à Alexandre.
            À son sourire.
            À ses mains chaudes.
            À ses rêves d'écrivain.</p>
            
            <p>Elle pensa à ce qu'elle avait perdu.
            Pas seulement l'argent.
            Pas seulement la maison.
            Mais l'amour.
            Le respect.
            Elle-même.</p>
            
            <p>Elle avait vendu tout ça.
            Pour de l'argent.
            Pour sauver des murs.
            Pour garder des apparences.</p>
            
            <p>Et maintenant, elle n'avait plus rien.
            Plus rien du tout.</p>
            
            <p>Juste un bébé dans son ventre.
            Et un avenir vide.
            Effrayant.
            Noir.</p>
            
            <p>Elle s'allongea à nouveau.
            Ferma les yeux.
            Essaya de dormir.</p>
            
            <p>Mais le sommeil ne vint pas.
            Juste les souvenirs.
            Les regrets.
            Les remords.</p>
            
            <p>Et cette question, encore et encore :
            "Que vais-je devenir ?
            Que va-t-il devenir ?
            Comment vais-je faire ?"</p>
            
            <p>Questions sans réponses.
            Peurs sans réconfort.
            Nuit sans fin.</p>
            
            <p>La chute était terminée.
            Elle avait touché le fond.
            Le fond froid, dur, de la réalité.</p>
            
            <p>Maintenant, il ne restait plus qu'à essayer de remonter.
            De reconstruire.
            De survivre.</p>
            
            <p>Mais comment ?
            Avec quoi ?
            Avec qui ?</p>
            
            <p>Elle ne savait pas.
            Elle ne savait plus rien.</p>
            
            <p>Juste qu'elle avait tout perdu.
            Et qu'elle devait trouver la force
            de recommencer.
            Pour le bébé.
            Pour elle-même.</p>
            
            <p>Mais la force... la force était partie.
            Avec l'argent.
            Avec l'amour.
            Avec tout.</p>
            
            <p>Il ne restait que la peur.
            Et la honte.
            Et cette petite vie qui grandissait en elle.
            Qui avait besoin d'elle.
            Qui dépendait d'elle.</p>
            
            <p>Malgré tout.
            Malgré elle.</p>
            ` },
            15: { title: "Chapitre 15: Le Fond du Gouffre", content:  `<p>Le mois passa trop vite. Comme un cauchemar qui accélère.
            Garance regarda les huissiers vider la maison. Les meubles,
            les tableaux, les souvenirs. Tout partait. Tout ce qui restait
            de sa famille. De sa vie.</p>
            
            <p>Elle était là, debout dans le hall vide, son ventre lourd.
            Seule. Édouard était parti la semaine précédente. Il avait pleuré
            en lui disant au revoir. "Prenez soin de vous, mademoiselle.
            Et du petit."</p>
            
            <p>Maintenant, il ne restait qu'elle. Et deux valises. Tout ce qu'elle
            pouvait emporter. Des vêtements. Quelques photos. Le portrait
            de son arrière-grand-mère, trop grand pour les valises, laissé
            derrière. Abandonné.</p>
            
            <p>Le dernier huissier, un homme aux yeux tristes, lui tendit une enveloppe.
            "Les objets personnels qu'on a pu sauver. Et... un peu d'argent.
            De la vente des derniers bijoux."</p>
            
            <p>Elle prit l'enveloppe. Trois mille euros. Trois mille euros
            pour toute une vie. Pour des générations de Saint-Clair.</p>
            
            <p>Dehors, le ciel était gris. Comme son cœur.
            Elle traîna ses valises sur le trottoir. Où aller ?
            Elle n'avait nulle part.</p>
            
            <p>Elle trouva une chambre d'hôtel bon marché près de la gare du Nord.
            Petite. Sale. Bruyante. Mais c'était un toit. Pour quelques nuits.</p>
            
            <p>Les jours qui suivirent furent un flou. Elle chercha un appartement.
            Mais sans travail, sans garant, personne ne voulait d'elle.
            Surtout enceinte de sept mois.</p>
            
            <p>L'argent diminuait. Rapidement. L'hôtel, la nourriture,
            les visites chez le médecin. Tout coûtait cher.
            Tout était difficile.</p>
            
            <p>Un soir, elle calcula : il lui restait de quoi tenir deux semaines.
            Puis plus rien. La rue. La vraie rue.</p>
            
            <p>La panique la prit. Une panique froide, qui lui serrait la gorge.
            Elle sortit de l'hôtel. Marcha sans but. Les rues de Paris
            étaient pleines de monde. De gens qui rentraient chez eux.
            Chez eux. Un mot qui n'avait plus de sens pour elle.</p>
            
            <p>Elle arriva devant la Seine. Le fleuve noir, luisant.
            Elle s'arrêta sur le pont. Regarda l'eau.
            Froide. Profonde. Accueillante.</p>
            
            <p>Une pensée traversa son esprit : "Et si je sautais ?
            Et si tout s'arrêtait là ? Plus de dettes. Plus de honte.
            Plus de peur."</p>
            
            <p>Elle posa les mains sur la rambarde. Froide. Humide.
            Elle se pencha. Regarda l'eau en dessous.
            Noire. Comme son avenir.</p>
            
            <p>Puis le bébé bougea. Un coup fort. Comme un rappel.
            "Je suis là. Ne fais pas ça."</p>
            
            <p>Elle recula. Tremblante. Choquée par ce qu'elle avait failli faire.
            Par ce qu'elle avait envisagé.</p>
            
            <p>"Non", murmura-t-elle. "Non. Je ne ferai pas ça."</p>
            
            <p>Elle s'éloigna du pont. Rapidement. Comme pour fuir
            la tentation. Comme pour fuir elle-même.</p>
            
            <p>Cette nuit-là, à l'hôtel, elle prit une décision.
            Elle irait à la maternité. Demander de l'aide.
            Avouer qu'elle n'avait nulle part où aller.
            Qu'elle avait peur.</p>
            
            <p>C'était humiliant. C'était la fin de sa fierté.
            Mais c'était ça ou la rue. Ça ou pire.</p>
            
            <p>Le lendemain matin, elle prit le métro pour la maternité de Port-Royal.
            Elle avait un rendez-vous de contrôle. Elle arriva tôt.
            S'assit dans la salle d'attente. Regarda les autres femmes.
            Certaines avec leur mari. D'autres avec leur mère.
            Toutes entourées. Soutenues.</p>
            
            <p>Elle, elle était seule. Complètement seule.</p>
            
            <p>Quand ce fut son tour, la sage-femme, une femme d'une cinquantaine
            d'années aux yeux doux, la regarda avec attention.</p>
            
            <p>"Comment allez-vous, madame de Saint-Clair ?"</p>
            
            <p>"Bien", mentit-elle.</p>
            
            <p>La sage-femme hocha la tête. Ne crut pas. "Votre tension est haute.
            Vous avez perdu du poids. Ce n'est pas normal à ce stade."</p>
            
            <p>"Je... j'ai des soucis."</p>
            
            <p>"Des soucis d'argent ?"</p>
            
            <p>Garance baissa la tête. Honteuse. "Oui."</p>
            
            <p>La sage-femme posa sa main sur la sienne. "Écoutez-moi.
            Je vois des femmes comme vous tous les jours. Des femmes
            qui ont peur. Qui sont seules. Vous n'êtes pas la première.
            Vous ne serez pas la dernière."</p>
            
            <p>Elle prit un formulaire. "Il y a des aides. Des centres
            d'hébergement pour femmes enceintes. Je vais vous donner
            les adresses. Et un numéro. Appelez. Maintenant."</p>
            
            <p>Garance prit les papiers. Les mains tremblantes.
            "Merci."</p>
            
            <p>"Et revenez la semaine prochaine. Ne restez pas seule.
            Parlez. Demandez de l'aide. C'est pour ça qu'on est là."</p>
            
            <p>En sortant de la maternité, Garance appela le numéro.
            Une voix gentille lui répondit. "Centre Élisa. Comment
            pouvons-nous vous aider ?"</p>
            
            <p>Elle expliqua. Rapidement. Sans entrer dans les détails.
            Femme enceinte. Sans logement. Sans ressources.</p>
            
            <p>"Venez cet après-midi. On a une place. Pour quelques semaines."</p>
            
            <p>Quelques semaines. Un répit. Un souffle.</p>
            
            <p>Elle retourna à l'hôtel. Fit ses valises. Paya la note.
            Il lui restait cinq cents euros. Cinq cents euros pour
            recommencer sa vie. Du fond du gouffre.</p>
            
            <p>Le centre Élisa était une vieille maison dans le 14ème.
            Simple. Propre. Pas luxueuse, mais chaleureuse.</p>
            
            <p>Une femme l'accueillit. "Je suis sœur Marie. Bienvenue."</p>
            
            <p>Elle lui montra sa chambre. Petite. Avec un lit, une commode,
            une fenêtre. Rien de plus. Mais c'était un refuge.
            Un toit. Une sécurité.</p>
            
            <p>"Les repas sont à la cuisine commune. Les cours de préparation
            à l'accouchement ont lieu le mercredi. Et si vous voulez parler...
            je suis là."</p>
            
            <p>Garance déposa ses valises. S'assit sur le lit.
            Regarda par la fenêtre. Un petit jardin. Des arbres.
            De la paix.</p>
            
            <p>Pour la première fois depuis des mois, elle se sentit
            un peu en sécurité. Un peu moins seule.</p>
            
            <p>Le soir, elle mangea à la cuisine commune avec les autres femmes.
            Des femmes de tous âges. De toutes situations. Certaines jeunes,
            très jeunes. D'autres plus âgées. Toutes avec des histoires.
            Des blessures. Des espoirs.</p>
            
            <p>Personne ne posait de questions. Personne ne jugeait.
            Chacune avait sa chambre. Son secret. Sa douleur.</p>
            
            <p>Garance se coucha tôt. Dans le lit étranger.
            Dans cette chambre étrangère.
            Dans cette vie étrangère.</p>
            
            <p>Mais elle dormit. Vraiment dormit.
            Pour la première fois depuis longtemps.
            Sans cauchemars.
            Sans peur.</p>
            
            <p>Le fond du gouffre avait été touché.
            Maintenant, il n'y avait plus qu'une direction possible :
            remonter.
            Lentement.
            Difficilement.
            Mais remonter.</p>
            
            <p>Pour le bébé.
            Pour elle.
            Pour ce qui restait de Garance de Saint-Clair.
            Pour ce qui allait naître d'elle.
            De cette épreuve.
            De cette chute.</p>
            
            <p>Une nouvelle vie commençait.
            Une vie difficile.
            Une vie humble.
            Mais une vie vraie.
            Pour la première fois.</p>
             ` },
            16: { title: "Chapitre 16: La Naissance", content:  `<p>Les semaines passèrent au centre Élisa. Garance s'habitua
            à cette vie simple. Elle aidait à la cuisine. Participait
            aux cours. Parlait parfois avec les autres femmes.
            Pas beaucoup. Mais un peu.</p>
            
            <p>Elle apprit des choses qu'elle n'aurait jamais imaginé.
            Comment changer une couche. Comment faire un biberon.
            Comment survivre avec peu d'argent.</p>
            
            <p>Sœur Marie devint une amie. Une présence douce, ferme.
            "Vous êtes plus forte que vous ne le pensez, Garance.
            Regardez tout ce que vous avez traversé."</p>
            
            <p>"J'ai fait des erreurs. Beaucoup d'erreurs."</p>
            
            <p>"Tout le monde fait des erreurs. L'important, c'est ce qu'on en fait.
            Comment on avance après."</p>
            
            <p>Un matin, à huit mois et demi de grossesse, les contractions commencèrent.
            D'abord légères. Puis plus fortes. Plus régulières.</p>
            
            <p>Sœur Marie l'emmena à la maternité. "Respirez. Tout va bien.
            Vous êtes en de bonnes mains."</p>
            
            <p>La salle d'accouchement était blanche. Brillante.
            Garance avait peur. Terriblement peur.
            Elle était seule. Pas de mari. Pas de mère.
            Pas d'ami.</p>
            
            <p>Une sage-femme lui prit la main. "Je suis là. Je ne vous quitte pas."</p>
            
            <p>Les heures passèrent. La douleur augmenta. Devenue un raz-de-marée
            qui emportait tout. Ses pensées. Sa peur. Son passé.</p>
            
            <p>Elle pensa à sa mère. Morte trop tôt.
            Elle pensa à son arrière-grand-mère. Si forte.
            Elle pensa à toutes les femmes de sa famille
            qui avaient accouché dans des lits à baldaquin,
            entourées de servantes, de médecins.</p>
            
            <p>Et elle, elle était dans une salle d'hôpital publique.
            Seule. Sans argent. Sans nom.</p>
            
            <p>Mais pas complètement seule. La sage-femme était là.
            Ses mains fermes. Sa voix calme. "Poussez. Vous y êtes presque."</p>
            
            <p>Et puis... le cri.
            Un premier cri. Fort. Clair.
            Un cri de vie.</p>
            
            <p>"C'est une fille", annonça la sage-femme.
            "Une belle petite fille."</p>
            
            <p>On posa le bébé sur sa poitrine. Petit. Rose. Criant encore.
            Les yeux fermés. Les petits poings serrés.</p>
            
            <p>Garance la regarda. Et quelque chose en elle se brisa.
            Ou se répara. Elle ne savait pas.</p>
            
            <p>C'était son enfant. Sa fille.
            Peu importe qui était le père.
            C'était sa fille.</p>
            
            <p>Elle la serra contre elle. Sentit sa chaleur.
            Son petit cœur qui battait. Sa vie.</p>
            
            <p>Les larmes vinrent. Douces, cette fois.
            Pas de honte. Pas de regrets.
            Juste de l'amour. Un amour immense,
            qui remplissait tout l'espace vide en elle.</p>
            
            <p>"Louise", murmura-t-elle. "Je t'appellerai Louise."</p>
            
            <p>Comme sa grand-mère. Une femme forte.
            Une femme qui avait survécu à la guerre.
            À la perte. À la vie.</p>
            
            <p>Elle espérait que sa fille serait forte, elle aussi.
            Plus forte qu'elle. Plus sage.</p>
            
            <p>Les jours qui suivirent à la maternité furent doux.
            Fatigants, mais doux. Elle apprit à allaiter.
            À changer les couches. À comprendre les pleurs.</p>
            
            <p>Louise était un bébé calme. Elle dormait beaucoup.
            Ouvrait ses grands yeux bleus de temps en temps.
            Regardait sa mère. Comme si elle la reconnaissait.
            Comme si elle disait : "Je suis là. On va s'en sortir."</p>
            
            <p>Un après-midi, alors que Garance faisait la sieste,
            une visiteuse arriva. Garance ouvrit les yeux.
            Vit une silhouette familière dans l'encadrement de la porte.</p>
            
            <p>Chloé.</p>
            
            <p>Elle tenait un petit bouquet de fleurs. Souriait timidement.
            "J'ai appris par Sofia. Elle a entendu parler... de la maison.
            Je... je suis désolée de ne pas être venue plus tôt."</p>
            
            <p>Garance se redressa. "Entre."</p>
            
            <p>Chloé s'approcha du lit. Regarda le bébé endormi.
            "Elle est belle. Comment elle s'appelle ?"</p>
            
            <p>"Louise."</p>
            
            <p>"C'est un joli nom." Un silence. Puis : "Pourquoi tu ne m'as rien dit ?
            Pourquoi tu ne m'as pas demandé de l'aide ?"</p>
            
            <p>Garance baissa les yeux. "J'avais honte. Et... tu avais changé.
            Tu étais devenue comme Sofia. Comme eux."</p>
            
            <p>Chloé rougit. "Oui. J'ai changé. L'argent... c'est tentant.
            Mais ce qui m'est arrivé... ça m'a fait réfléchir."</p>
            
            <p>Elle s'assit sur le bord du lit. Parla doucement.
            "J'ai quitté la galerie. Les hommes riches. Tout ça.
            Je suis retournée à mes études. Je travaille dans une bibliothèque
            maintenant. Moins d'argent. Mais plus de dignité."</p>
            
            <p>Garance la regarda, surprise. "Vraiment ?"</p>
            
            <p>"Vraiment. Et j'ai un petit appartement. Deux chambres.
            Si tu veux... quand tu sortiras d'ici... tu pourras venir.
            Toi et Louise. Le temps de retrouver tes marques."</p>
            
            <p>Les larmes revinrent. Mais bonnes, cette fois.
            Des larmes de gratitude. De soulagement.</p>
            
            <p>"Tu es sûre ?"</p>
            
            <p>"Très sûre. On est amies, non ? Les vraies amies, ça aide.
            Dans les bons moments. Et dans les moins bons."</p>
            
            <p>Chloé prit sa main. "Tu n'es pas seule, Garance.
            Plus maintenant."</p>
            
            <p>Louise se réveilla. Ouvrit ses grands yeux.
            Regarda les deux femmes. Comme si elle comprenait.
            Comme si elle savait que sa vie serait différente
            de celle de sa mère. Meilleure, peut-être.</p>
            
            <p>Chloé resta toute l'après-midi. Parla de tout et de rien.
            De ses nouvelles études. De Paris. De la vie simple
            qu'elle avait choisie.</p>
            
            <p>Quand elle partit, elle promit de revenir le lendemain.
            "On va s'organiser. Trouver des solutions. Ensemble."</p>
            
            <p>Garance regarda dormir sa fille. Doucement.
            La main sur sa petite tête.</p>
            
            <p>Pour la première fois depuis très longtemps,
            elle sentit de l'espoir.
            Un espoir fragile, timide.
            Mais réel.</p>
            
            <p>Elle avait perdu beaucoup.
            Presque tout.
            Mais elle avait gagné une fille.
            Et retrouvé une amie.
            Et peut-être... peut-être retrouvé
            un peu d'elle-même.
            La vraie Garance.
            Celle qui pouvait aimer.
            Celle qui pouvait être aimée.
            Celle qui pouvait recommencer.</p>
            
            <p>La nuit tomba sur Paris.
            Sur la maternité.
            Sur la chambre où une mère
            et sa fille dormaient,
            ensemble,
            pour la première nuit
            de leur nouvelle vie.
            Une vie difficile,
            mais une vie à elles.
            Vraiment à elles.</p>
             ` },
            17: { title: "Chapitre 17: Le Nouveau Départ", content:  ` <p>Le petit appartement de Chloé était dans le 11ème arrondissement.
            Pas grand. Pas luxueux. Mais propre, clair, chaleureux.
            Il y avait des livres partout. Des plantes. Des photos de famille.
            Une vraie maison. Pas un musée comme l'hôtel particulier.</p>
            
            <p>Garance et Louise s'installèrent dans la seconde chambre.
            Une chambre simple, avec un lit, une commode, et un berceau
            que Chloé avait acheté d'occasion.</p>
            
            <p>"C'est temporaire", dit Garance en déposant ses valises.
            "Je vais chercher du travail. Trouver mon propre logement."</p>
            
            <p>"Prends ton temps", répondit Chloé. "On a tout le temps."</p>
            
            <p>Les premières semaines furent difficiles. Louise pleurait la nuit.
            Garance était fatiguée. Elle avait du mal à trouver un rythme.
            À être mère. À être une femme qui recommence à zéro.</p>
            
            <p>Mais Chloé était là. Elle aidait. Elle préparait à manger.
            Elle gardait Louise pendant que Garance cherchait du travail.</p>
            
            <p>La recherche d'emploi était décourageante. Sans diplômes récents,
            sans expérience professionnelle "normale", les portes se fermaient.
            "Vous avez fait quoi ces dernières années ?" demandaient les employeurs.</p>
            
            <p>"J'étais... conseillère en art", mentait-elle.
            Mais les mensonges étaient difficiles à tenir. Et elle ne voulait plus mentir.
            Plus jamais.</p>
            
            <p>Un jour, en promenant Louise dans le parc, elle vit un groupe de touristes.
            Ils regardaient une vieille maison. Un guide parlait : "Ici vivait
            la famille de Saint-Clair au XVIIIème siècle..."</p>
            
            <p>Garance s'arrêta. Écouta. Le guide racontait des histoires.
            Des anecdotes. Des secrets de famille. Et il se trompait.
            Sur plusieurs points.</p>
            
            <p>Elle s'approcha. "Excusez-moi, mais ce n'est pas exact.
            Les Saint-Clair n'habitaient pas ici en 1750. Ils étaient
            à la cour de Versailles. Cette maison appartenait à une branche
            cadette, et seulement à partir de 1780."</p>
            
            <p>Le guide la regarda, surpris. "Vous êtes historienne ?"</p>
            
            <p>"Non. Je... je connais bien cette famille."</p>
            
            <p>Les touristes l'écoutaient maintenant. Intéressés.
            Elle parla encore. D'autres anecdotes. D'autres histoires.
            Des choses qu'elle savait depuis l'enfance. Des secrets
            transmis de génération en génération.</p>
            
            <p>À la fin, un touriste lui donna un pourboire.
            "C'était passionnant ! Vous devriez faire ça professionnellement."</p>
            
            <p>L'idée germa dans son esprit. Pourquoi pas ?
            Elle connaissait Paris. Les vieilles familles.
            Les histoires. Les secrets.</p>
            
            <p>Elle en parla à Chloé le soir même.
            "Des visites guidées ? Mais tu n'as pas de diplôme
            de guide conférencier."</p>
            
            <p>"Je pourrais commencer petit. Des visites privées.
            Pour des petits groupes. Des amis d'amis."</p>
            
            <p>Chloé réfléchit. "C'est une bonne idée. Et je pourrais t'aider.
            Faire de la publicité. Sur les réseaux sociaux."</p>
            
            <p>Elles commencèrent simplement. Chloé créa une page internet.
            "Visites Parisiennes : Secrets d'Aristocrates". Elle écrivit
            une présentation. Mise quelques photos de Garance (sans montrer
            son visage clairement, par discrétion).</p>
            
            <p>Les premiers clients furent des amis de Chloé. Puis des amis d'amis.
            Garance préparait ses visites avec soin. Elle choisissait des thèmes :
            "Les Scandales du Marais". "Les Amours Secrètes du Faubourg Saint-Germain".
            "Les Fantômes des Hôtels Particuliers".</p>
            
            <p>Elle parlait bien. Elle savait captiver. Et elle connaissait
            des choses que les guides officiels ne savaient pas.
            Des détails intimes. Des histoires vraies.</p>
            
            <p>L'argent rentrait lentement. Pas beaucoup. Mais assez.
            Assez pour contribuer au loyer. Assez pour acheter
            des couches, du lait, ce dont Louise avait besoin.</p>
            
            <p>Un après-midi, lors d'une visite dans le Marais,
            elle croisa Sofia. Par hasard. Sofia sortait d'une boutique de luxe.
            Ses bras chargés de sacs.</p>
            
            <p>Elles se regardèrent. Un moment de gêne.</p>
            
            <p>"Garance", dit enfin Sofia. "Comment vas-tu ?"</p>
            
            <p>"Bien. Et toi ?"</p>
            
            <p>"Comme toujours." Sofia regarda le petit groupe qui attendait Garance.
            "Tu travailles ?"</p>
            
            <p>"Oui. Je fais des visites guidées."</p>
            
            <p>Un léger sourire. Pas méchant. Juste... nostalgique.
            "Tu as changé."</p>
            
            <p>"Oui."</p>
            
            <p>Sofia hésita. "L'enfant... c'est une fille ?"</p>
            
            <p>"Oui. Louise."</p>
            
            <p>"Belle. Comme toi, sans doute." Elle regarda ses sacs.
            Ses bijoux. Ses vêtements de luxe. "Moi, je n'ai pas changé.
            Je ne peux pas. L'argent... c'est une drogue. On s'habitue.
            On ne peut plus s'en passer."</p>
            
            <p>Elle tourna les talons. Puis se retourna. "Si tu as besoin...
            de clients riches pour tes visites... je connais des gens.
            Des gens qui aiment les histoires de vieilles familles.
            Pour impressionner leurs amis."</p>
            
            <p>"Merci. Mais... je préfère faire sans. Pour l'instant."</p>
            
            <p>Sofia hocha la tête. Compris. "Comme tu veux.
            Bon courage, Garance."</p>
            
            <p>Elle partit. Ses talons claquant sur le pavé.
            Sa silhouette parfaite qui s'éloignait.
            Vers son monde d'or et de solitudes.</p>
            
            <p>Garance regarda son groupe. Des gens normaux.
            Des touristes. Des curieux. Des passionnés d'histoire.
            Pas des clients qui payaient pour son nom.
            Pour son image.</p>
            
            <p>Elle sourit. "Alors, où en étions-nous ?
            Ah oui, l'histoire du duc et de la danseuse..."</p>
            
            <p>Elle reprit sa visite. Sa voix était assurée.
            Son cœur était léger.</p>
            
            <p>Elle gagnait peu. Mais cet argent était propre.
            Gagné avec son savoir. Son travail. Sa passion.</p>
            
            <p>Pas avec son sourire.
            Pas avec son corps.
            Pas avec son nom.</p>
            
            <p>Juste avec elle-même.
            Garance.
            Pas de Saint-Clair.
            Juste Garance.
            Mère de Louise.
            Guide touristique.
            Femme qui recommence.</p>
            
            <p>Le soir, en rentrant, elle prit Louise dans ses bras.
            La serra contre elle.</p>
            
            <p>"Regarde, ma puce", murmura-t-elle.
            "Maman a travaillé aujourd'hui.
            Pour nous.
            Pour notre vie à nous."</p>
            
            <p>Louise gazouilla. Sourit.
            Un petit sourire sans dents.
            Le plus beau sourire du monde.</p>
            
            <p>Garance sourit aussi.
            Pour la première fois depuis très longtemps,
            son sourire était vrai.
            Venait du cœur.
            Venait du bonheur simple
            d'une vie simple.
            D'une vie à elle.
            Enfin.</p>
            ` },
            18: { title: "Chapitre 18: Les Premiers Pas Seuls", content:  `<p>Six mois plus tard, Garance avait assez économisé
            pour louer un petit studio. Dans le même quartier que Chloé.
            Très petit. 25 mètres carrés. Mais à elle.
            Seulement à elle et à Louise.</p>
            
            <p>Le jour de l'emménagement, Chloé vint aider.
            "Tu es sûre ? Tu pourrais rester encore. Ça ne me dérange pas."</p>
            
            <p>"Je suis sûre. Il faut que j'apprenne à voler de mes propres ailes.
            Et puis... tu as ta vie. Tu as rencontré quelqu'un, non ?"</p>
            
            <p>Chloé rougit. "Oui. Antoine. Un professeur. Pas riche.
            Mais gentil. Très gentil."</p>
            
            <p>Garance sourit. "Je suis contente pour toi."</p>
            
            <p>Elles déballèrent les cartons. Les quelques affaires de Garance.
            Les jouets de Louise. Les livres. Pas beaucoup de choses.
            Mais assez. Assez pour une vie simple.</p>
            
            <p>Le soir, après le départ de Chloé, Garance s'assit par terre
            dans le salon/chambre. Louise dormait dans son berceau.
            La pièce était silencieuse. Modeste. Mais c'était chez elle.</p>
            
            <p>Elle pensa à l'hôtel particulier. Aux grandes pièces vides.
            Aux meubles couverts de draps. Aux fantômes.</p>
            
            <p>Ici, il n'y avait pas de fantômes. Pas de passé qui pesait.
            Juste le présent. Juste elle et sa fille.</p>
            
            <p>Les visites guidées marchaient bien. Elle avait maintenant
            des clients réguliers. Des retraités passionnés d'histoire.
            Des étudiants. Des étrangers.</p>
            
            <p>Elle gagnait assez pour vivre. Pas pour s'acheter des robes
            de créateur. Pas pour dîner dans des restaurants trois étoiles.
            Mais assez pour le loyer. La nourriture. Les besoins de Louise.</p>
            
            <p>Un jour, elle reçut une lettre. Des huissiers. Encore.
            Mais cette fois, c'était une bonne nouvelle.
            La vente de l'hôtel particulier avait rapporté plus
            que ses dettes. Il lui restait un petit montant.
            Très petit. Mais quelque chose.</p>
            
            <p>Elle alla à la banque. Retira l'argent. Trois mille euros.
            Trois mille euros qui représentaient tout ce qui restait
            de sa vie passée. De sa famille. De son nom.</p>
            
            <p>Elle aurait pu dépenser cet argent. S'acheter des choses.
            Mais non. Elle l'économisa. Pour Louise.
            Pour ses études plus tard.
            Pour son avenir.</p>
            
            <p>L'avenir... un mot qui ne lui faisait plus peur maintenant.
            Qui lui donnait même de l'espoir.</p>
            
            <p>Un après-midi, en promenant Louise dans le parc,
            elle vit Alexandre. Par hasard. Il était assis sur un banc.
            Il lisait. Il avait l'air différent. Plus âgé. Plus sérieux.</p>
            
            <p>Leurs yeux se croisèrent. Un moment de surprise.
            Puis il se leva. S'approcha.</p>
            
            <p>"Garance."</p>
            
            <p>"Alexandre."</p>
            
            <p>Un silence. Gêné. Puis : "C'est elle ?"</p>
            
            <p>"Oui. Louise."</p>
            
            <p>Il regarda le bébé. Longuement. "Elle est belle."</p>
            
            <p>"Merci."</p>
            
            <p>Louise ouvrit les yeux. Le regarda. Gazouilla.
            Alexandre sourit. Malgré lui.</p>
            
            <p>"Comment vas-tu ?" demanda-t-il.</p>
            
            <p>"Bien. Je travaille. Je vis. C'est... simple. Mais bien."</p>
            
            <p>"Et toi ?"</p>
            
            <p>"J'ai terminé mes études. Je suis écrivain maintenant.
            Enfin... j'essaie. C'est difficile. Mais je suis publié.
            Un petit recueil de nouvelles."</p>
            
            <p>"Je suis contente pour toi."</p>
            
            <p>Un autre silence. Puis : "Je pense souvent à toi.
            À ce qui s'est passé. J'ai été dur, peut-être."</p>
            
            <p>"Non. Tu as eu raison. J'aurais fait la même chose à ta place."</p>
            
            <p>Il hésita. "Si tu as besoin... d'aide... pour elle..."</p>
            
            <p>"Merci. Mais on s'en sort. Vraiment."</p>
            
            <p>Il hocha la tête. "Je le vois. Tu as changé."</p>
            
            <p>"Oui."</p>
            
            <p>Il prit un livre dans son sac. "Tiens. Pour toi.
            Mes nouvelles. Si ça t'intéresse."</p>
            
            <p>Elle prit le livre. "Merci."</p>
            
            <p>Il tourna les talons. Puis se retourna. "Au revoir, Garance."</p>
            
            <p>"Au revoir, Alexandre."</p>
            
            <p>Il partit. Elle resta sur le banc. Le livre à la main.
            Louise dans l'autre bras.</p>
            
            <p>Elle ouvrit le livre. À la dédicace : "À G.
            Qui m'a appris que certaines histoires
            n'ont pas de fin heureuse.
            Mais qu'on peut toujours écrire
            le chapitre suivant."</p>
            
            <p>Elle sourit. Tristement. Doucement.</p>
            
            <p>Alexandre était le passé. Un passé douloureux.
            Mais un passé qui avait été vrai, aussi.
            Un amour vrai, même s'il n'avait pas duré.</p>
            
            <p>Elle rangea le livre dans le sac à langer.
            Se leva. Reprit sa promenade.</p>
            
            <p>Le soleil brillait. Les oiseaux chantaient.
            Louise riait.</p>
            
            <p>La vie continuait.
            Avec ses regrets.
            Ses souvenirs.
            Mais aussi avec ses joies simples.
            Ses petits bonheurs.
            Ses nouveaux départs.</p>
            
            <p>Garance marchait.
            Une femme parmi d'autres.
            Une mère.
            Une travailleuse.
            Une survivante.</p>
            
            <p>Plus une aristocrate déchue.
            Plus une femme à louer.
            Plus une victime.</p>
            
            <p>Juste elle-même.
            Garance.
            Libre.
            Enfin libre.</p>
            
            <p>Libre de l'argent.
            Libre du passé.
            Libre d'être heureuse.
            À sa manière.
            Dans sa vie à elle.
            Simple.
            Vraie.
            Enfin sienne.</p>
             `},
            19: { title: "Chapitre 19: La Conférence", content:  `

            <p>Deux ans passèrent. Comme un fleuve tranquille.
            Garance et Louise vivaient dans le même petit studio.
            Il était devenu plus chaleureux avec le temps.
            Des dessins de Louise sur les murs. Des photos.
            Des livres. Des souvenirs heureux.</p>
            
            <p>Les visites guidées étaient maintenant une véritable petite entreprise.
            Garance employait même une autre guide, une étudiante en histoire.
            Elles proposaient des thèmes originaux. "Les Femmes Célèbres de Paris".
            "Les Secrets du Paris Médiéval". "Les Amours des Écrivains".</p>
            
            <p>Elle gagnait correctement sa vie. Pas richement. Mais décemment.
            Assez pour mettre de l'argent de côté pour les études de Louise.
            Assez pour s'offrir de petites joies. Un week-end à la mer.
            Un bon repas de temps en temps.</p>
            
            <p>Un jour, elle reçut une invitation. Un ancien client,
            devenu ami, organisait une conférence sur l'histoire
            des familles aristocratiques parisiennes. Il voulait qu'elle parle.
            Qu'elle raconte son expérience. Non pas comme héritière,
            mais comme historienne. Comme témoin d'un monde disparu.</p>
            
            <p>Elle hésita. Parler en public ? Révéler qui elle était ?
            Ou plutôt, qui elle avait été ?</p>
            
            <p>Chloé l'encouragea. "Fais-le. C'est ton histoire.
            Tu peux en être fière maintenant. Tu as survécu.
            Tu as reconstruit."</p>
            
            <p>"Mais tout dire ? Tout révéler ?"</p>
            
            <p>"Pas tout. Juste ce que tu veux partager.
            Ce qui peut aider d'autres."</p>
            
            <p>Garance réfléchit pendant plusieurs jours.
            La nuit, elle regardait Louise dormir.
            Cette petite vie qu'elle avait créée.
            Malgré tout. À cause de tout.</p>
            
            <p>Elle décida d'accepter.
            Pas pour se faire pardonner.
            Pas pour se vanter.
            Mais pour témoigner.
            Pour dire : "Regardez. On peut tomber très bas.
            Et se relever. Difficilement. Mais on peut."</p>
            
            <p>Le jour de la conférence, Garance était nerveuse.
            Elle avait mis une robe simple. Bleu marine.
            Ses cheveux étaient attachés en chignon bas.
            Pas de bijoux. Juste elle.
            Elle semblait jeune. Sereine. Différente de la femme
            brisée qu'elle avait été.</p>
            
            <p>La salle était pleine. Des visages inconnus.
            Des curieux. Des passionnés d'histoire.
            Des étudiants. Des personnes âgées.</p>
            
            <p>Elle monta sur l'estrade. Regarda l'auditoire.
            Pris une profonde inspiration.</p>
            
            <p>"Bonjour. Je m'appelle Garance.
            Je vais vous parler aujourd'hui des vieilles familles parisiennes.
            De leurs traditions. De leurs secrets.
            Et de leur chute, parfois."</p>
            
            <p>Elle parla d'abord timidement. Puis avec plus d'assurance.
            Elle raconta des anecdotes. Des histoires drôles.
            Des tragédies aussi.</p>
            
            <p>Puis vint le moment difficile.
            "Je viens de l'une de ces familles.
            Je suis née Garance de Saint-Clair.
            Un nom qui sonne bien. Qui fait rêver.
            Mais un nom qui peut être un poids.
            Une prison dorée."</p>
            
            <p>Elle parla de son enfance. Des grandes pièces vides.
            Des portraits qui vous regardent. Des attentes.
            Des "il faut". Toujours des "il faut".</p>
            
            <p>"Quand ma famille a tout perdu, j'ai cru
            que l'argent pourrait tout sauver. Tout réparer.
            Je me suis trompée. L'argent peut acheter beaucoup de choses.
            Mais pas le respect de soi. Pas la paix intérieure.
            Pas le vrai bonheur."</p>
            
            <p>Elle ne parla pas des détails. Pas des hommes.
            Pas de la nuit sur le yacht. Pas de la violence.
            Elle parla des conséquences. De la honte.
            De la solitude. De la peur.</p>
            
            <p>"J'ai touché le fond. Le vrai fond.
            Plus d'argent. Plus de maison. Plus d'amis.
            Juste moi. Et ma peur.
            Et puis... une petite vie qui grandissait en moi.
            Ma fille. Louise."</p>
            
            <p>Elle sourit en prononçant ce nom.
            Un vrai sourire. Chaleureux.</p>
            
            <p>"Elle m'a sauvée. Sans le savoir.
            Parce que pour elle, il fallait continuer.
            Il fallait se battre. Recommencer.
            Apprendre à vivre autrement.
            À être autre chose qu'un nom.
            Qu'un titre. Qu'un prix."</p>
            
            <p>Elle parla de son travail. Des visites guidées.
            De la fierté de gagner sa vie honnêtement.
            De la joie simple de voir des gens intéressés.
            De partager. D'enseigner. De transmettre.</p>
            
            <p>"J'ai appris que notre valeur ne vient pas de notre nom.
            Ni de notre compte en banque. Elle vient de ce que nous faisons.
            De comment nous traitons les autres.
            De comment nous nous traitons nous-mêmes.
            De comment nous relevons après une chute."</p>
            
            <p>À la fin, les applaudissements furent chaleureux.
            Soutenus. Respectueux.</p>
            
            <p>Des gens vinrent la voir. Pour la féliciter.
            Pour lui poser des questions. Pour lui dire merci.</p>
            
            <p>Une jeune femme s'approcha. Timide. Les yeux baissés.
            "Madame... Votre histoire... elle m'a touchée.
            Parce que moi aussi... j'ai fait des choix.
            Pour l'argent. Des choix dont j'ai honte."</p>
            
            <p>Garance posa une main sur son bras.
            Doucement. "La honte passe.
            Si on agit. Si on change.
            Si on devient la personne qu'on veut vraiment être."</p>
            
            <p>"Mais c'est si difficile..."</p>
            
            <p>"Oui. Très difficile. Mais possible.
            Regardez-moi. Je suis là.
            J'ai survécu. Vous survivrez aussi."</p>
            
            <p>La jeune femme hocha la tête. Les yeux brillants.
            "Merci."</p>
            
            <p>Garance la regarda partir.
            Cette jeune femme. Comme elle l'avait été.
            Perdue. Effrayée. Honteuse.
            Mais avec une lueur d'espoir, maintenant.
            Une petite flamme. Fragile. Mais réelle.</p>
            
            <p>En rangeant ses notes, elle vit une silhouette
            familière au fond de la salle. Sofia.
            Elle était là, debout près de la porte.
            Elle ne s'était pas approchée. Juste écoutée.</p>
            
            <p>Leurs yeux se croisèrent à travers la salle.
            Un moment suspendu. Deux mondes qui se regardent.
            Celui qu'elle avait quitté. Celui qu'elle avait choisi.</p>
            
            <p>Sofia fit un petit signe de tête.
            À peine perceptible.
            Puis elle tourna les talons.
            Partit.
            Sans un mot.</p>
            
            <p>Garance comprit.
            Sofia était toujours dans son monde d'or.
            Mais elle était venue écouter.
            Peut-être par curiosité.
            Peut-être par nostalgie.
            Peut-être par espoir, aussi.
            Qu'un jour, elle aussi pourrait changer.
            Quitter la cage dorée.
            Découvrir la liberté.
            La vraie liberté.
            Celle qui ne s'achète pas.
            Celle qui se gagne.
            Celle qui se mérite.</p>
            
            <p>Garance rangea ses affaires.
            Sortit de la salle.
            Le soleil de l'après-midi l'accueillit.
            Chaud. Doux.
            Comme une caresse.
            Comme une bénédiction.</p>
            
            <p>Elle avait parlé.
            Elle avait témoigné.
            Elle avait partagé sa vérité.
            Et le ciel ne lui était pas tombé sur la tête.
            Le sol ne s'était pas ouvert sous ses pieds.</p>
            
            <p>Au contraire.
            Elle se sentait plus légère.
            Plus libre.
            Plus elle-même.
            Que jamais auparavant.</p>
            
            <p>Elle sourit.
            Un sourire pour elle seule.
            Un sourire de victoire.
            Silencieuse.
            Modeste.
            Mais réelle.</p>
            
            <p>Elle avait survécu.
            Elle avait reconstruit.
            Elle avait trouvé sa place.
            Sa vraie place.
            Dans le monde.
            Dans la vie.
            Dans son cœur.</p>
            
            <p>Et maintenant,
            elle allait retrouver
            ce qui comptait vraiment.
            Ce pour quoi tout avait valu la peine.
            Ce qui donnait un sens à tout.</p>
            
            <p>Sa fille.
            Son amour.
            Sa vie.
            Enfin sienne.
            Enfin vraie.
            Enfin.</p> ` },
            20: { title: "Chapitre 20: Épilogue - Le Cœur", content:  `

            <p>Dehors, devant la salle de conférence, Chloé attendait avec Louise.
            La petite fille, maintenant âgée de deux ans et demi,
            courait sur le trottoir, attrapant les feuilles mortes
            qui tombaient des arbres. Automne. La saison du changement.</p>
            
            <p>"Maman !" cria Louise en apercevant Garance.
            Elle courut vers elle, les bras ouverts.
            Les boucles blondes dans le vent.
            Les yeux rieurs, pleins de vie.</p>
            
            <p>Garance la souleva dans ses bras. La serra fort.
            Sentit son petit cœur battre contre le sien.
            Rapide. Joyeux. Insouciant.</p>
            
            <p>"Alors, tu as été sage avec tatie Chloé ?"</p>
            
            <p>"Très sage ! On a mangé des gâteaux !
            Et on a vu des pigeons !"</p>
            
            <p>Chloé s'approcha. Sourit. "Elle a été adorable.
            Et toi ? Comment ça s'est passé ?"</p>
            
            <p>"Bien. Très bien, même."</p>
            
            <p>"Je savais que tu en étais capable."</p>
            
            <p>Elles marchèrent vers le métro. Les trois.
            Comme une famille. Pas une famille de sang.
            Une famille choisie. Une famille de cœur.</p>
            
            <p>Garance regarda Chloé. Son amie. Celle qui était restée.
            Qui avait aidé. Qui avait cru en elle, même quand
            elle ne croyait plus en elle-même.</p>
            
            <p>"Merci", murmura-t-elle.</p>
            
            <p>"Pour quoi ?"</p>
            
            <p>"Pour tout. Pour être là. Pour ne pas m'avoir jugée.
            Pour m'avoir tendu la main quand je tombais."</p>
            
            <p>Chloé lui prit la main. "Les vraies amies, c'est pour ça.
            Pour les bons moments. Et pour les moins bons."</p>
            
            <p>Dans le métro, Louise s'endormit sur les genoux de Garance.
            Sa petite tête lourde. Sa respiration régulière.
            Sa confiance absolue.</p>
            
            <p>Garance regarda par la fenêtre.
            Paris défilait. Les stations. Les gens.
            La vie qui continue. Toujours.</p>
            
            <p>Elle pensa à son parcours.
            À l'hôtel particulier vide.
            Au yacht de Marco.
            À la chambre d'hôtel minable.
            À l'hôpital.
            Au petit studio.
            À chaque étape. Chaque chute. Chaque relever.</p>
            
            <p>Elle n'était plus la même.
            La Garance d'avant était morte.
            Une nouvelle Garance était née.
            Plus forte. Plus sage. Plus vraie.</p>
            
            <p>Elle avait appris des choses précieuses.
            Que l'argent était un outil.
            Pas un but. Pas une valeur.
            Un outil qui pouvait construire ou détruire.
            Qui pouvait libérer ou emprisonner.
            Tout dépendait de comment on l'utilisait.
            De ce qu'on était prêt à sacrifier pour lui.</p>
            
            <p>Elle avait appris que le vrai pouvoir
            n'était pas dans le compte en banque.
            Mais dans la capacité à se relever.
            À recommencer.
            À aimer malgré tout.
            À pardonner, surtout à soi-même.
            À vivre, simplement vivre.
            À trouver la beauté dans la simplicité.
            La richesse dans l'authenticité.
            La liberté dans la vérité.</p>
            
            <p>Le métro s'arrêta. Sa station.
            Elle se leva doucement, pour ne pas réveiller Louise.
            Sortit. Remonta vers la lumière du jour.</p>
            
            <p>Arrivée devant son immeuble, elle s'arrêta.
            Regarda la façade simple. Modeste.
            Rien à voir avec l'hôtel particulier.
            Mais c'était chez elle.
            Vraiment chez elle.</p>
            
            <p>Elle monta les escaliers.
            Le troisième étage.
            La porte bleue.
            Sa clé dans la serrure.</p>
            
            <p>À l'intérieur, le studio était chaleureux.
            Les dessins de Louise sur le frigo.
            Les livres sur les étagères.
            Les plantes sur le rebord de la fenêtre.
            La lumière du soir qui entrait, dorée.</p>
            
            <p>Elle déposa Louise délicatement sur le petit lit.
            La couvrit. L'embrassa sur le front.</p>
            
            <p>"Dors bien, ma puce.
            Tu es mon plus beau trésor.
            Le seul qui compte vraiment."</p>
            
            <p>Elle alla à la fenêtre. Regarda la rue en dessous.
            Les gens qui rentraient chez eux.
            Les lumières qui s'allumaient dans les appartements.
            La vie. La vraie vie. Simple. Normale. Belle.</p>
            
            <p>Son téléphone vibra. Un message.
            De la sage-femme de la maternité.
            "Je viens de voir votre conférence en ligne.
            Félicitations. Vous êtes un bel exemple.
            Pour toutes les femmes qui doutent.
            Qui ont peur. Qui pensent qu'elles n'y arriveront pas."</p>
            
            <p>Garance sourit. Répondit :
            "Merci. C'est grâce à des personnes comme vous.
            Qui tendent la main. Qui ne jugent pas.
            Qui croient en la possibilité du changement."</p>
            
            <p>Elle éteignit son téléphone.
            S'assit dans son fauteuil.
            Le vieux fauteuil acheté d'occasion.
            Confortable. Fiable. Comme sa vie maintenant.</p>
            
            <p>Elle pensa à Alexandre.
            À leur amour. Vrai mais impossible.
            À leur rupture. Douloureuse mais nécessaire.
            Elle espérait qu'il était heureux.
            Qu'il écrivait. Qu'il vivait ses rêves.</p>
            
            <p>Elle pensa à Sofia.
            Enfermée dans sa cage dorée.
            Brillante mais seule.
            Riche mais pauvre de cœur.
            Elle lui souhaita, en silence,
            de trouver un jour la porte de sortie.
            Le courage de changer.
            La force de vouloir autre chose.</p>
            
            <p>Elle pensa à tous les hommes.
            Mercier. Karl. James. Marco.
            Ils continuaient sans doute leur vie.
            Avec d'autres femmes. D'autres transactions.
            Sans remords. Sans regrets.
            Elle leur pardonnait.
            Non pour eux.
            Pour elle.
            Pour être libre.
            Vraiment libre.</p>
            
            <p>La nuit tomba doucement.
            Garance alluma une petite lampe.
            La lumière douce éclaira la pièce.
            Son chez-elle.
            Son refuge.
            Son royaume.</p>
            
            <p>Elle prit un carnet.
            Celui où elle écrivait parfois.
            Pour Louise. Pour plus tard.
            Pour qu'elle sache. Qu'elle comprenne.</p>
            
            <p>Elle écrivit :</p>
            
            <p><i>"Ma chère Louise,</i></p>
            
            <p><i>Quand tu liras ces mots, tu seras grande.
            Tu auras ta vie. Tes choix. Tes erreurs, peut-être.
            Je t'écris pour te dire une chose essentielle :
            ta valeur n'est pas dans ce que tu as.
            Mais dans ce que tu es.</i></p>
            
            <p><i>L'argent vient et part.
            Les choses s'achètent et se perdent.
            Les gens entrent dans ta vie et en sortent.
            Mais toi, tu restes.
            Ton cœur. Ton âme. Ta vérité.
            C'est ça, ton vrai trésor.
            Le seul qui compte.
            Le seul qui dure.</i></p>
            
            <p><i>N'oublie jamais :
            tu es précieuse.
            Pas parce que tu coûtes cher.
            Mais parce que tu es unique.
            Parce que tu es toi.
            Parce que tu existes.
            Parce que tu aimes.
            Parce que tu vis.</i></p>
            
            <p><i>Tout le reste...
            l'argent, les bijoux, les maisons...
            ce n'est que du bruit.
            De la poussière.
            Des illusions.</i></p>
            
            <p><i>Le vrai bonheur est silencieux.
            Il est simple.
            Il est là, dans ton cœur.
            Toujours.
            Attendant que tu le reconnaisses.
            Que tu le choisisses.
            Que tu le vives.</i></p>
            
            <p><i>Je t'aime,
            Maman."</i></p>
            
            <p>Elle referma le carnet.
            Le rangea dans un tiroir.
            Avec les autres souvenirs.
            Les photos. Les lettres. Les dessins.</p>
            
            <p>Puis elle alla se coucher.
            À côté de Louise.
            Sa petite fille.
            Son ange.
            Son salut.</p>
            
            <p>Elle la regarda dormir.
            Paisible. Confiante. Aimée.</p>
            
            <p>"Merci", murmura-t-elle.
            "Merci d'être là.
            Merci d'exister.
            Merci de m'avoir sauvée."</p>
            
            <p>Elle s'allongea.
            Ferma les yeux.
            Écouta la respiration de sa fille.
            Régulière. Douce. Vivante.</p>
            
            <p>La paix l'envahit.
            Une paix profonde.
            Vraie.
            Méritée.</p>
            
            <p>Elle n'avait plus besoin d'or pour briller.
            Elle brillait déjà.
            De la lumière de l'amour.
            De la force de la survie.
            De la sagesse des épreuves traversées.
            De la paix de la vérité acceptée.</p>
            
            <p>Elle était libre.
            Enfin libre.
            Libre des chaînes de l'argent.
            Libre du poids du nom.
            Libre des prisons du passé.
            Libre des peurs de l'avenir.</p>
            
            <p>Libre d'être.
            Simplement être.
            Garance.
            Mère.
            Femme.
            Humaine.
            Imparfaite.
            Vivante.
            Heureuse.
            Enfin.</p>
            
            <p>Et ça,
            ce sentiment de liberté,
            cette paix du cœur,
            cette vérité retrouvée,
            c'était plus précieux
            que tous les trésors du monde.
            Que tous les diamants.
            Que tous les palais.
            Que tout l'or de la terre.</p>
            
            <p>Car l'or trompe.
            Il brille, puis ternit.
            Il promet, puis déçoit.
            Il achète tout,
            sauf l'essentiel.
            Sauf le bonheur vrai.
            Sauf l'amour pur.
            Sauf la paix du cœur.
            Sauf la liberté de l'âme.</p>
            
            <p>Et Garance,
            après avoir tout perdu,
            après être tombée si bas
            qu'elle pensait ne plus jamais se relever,
            avait enfin trouvé
            ce qui ne pouvait pas s'acheter :
            elle-même.
            Sa vérité.
            Sa force.
            Son amour.
            Sa vie.
            Enfin sienne.
            Enfin vraie.
            Enfin libre.
            Enfin.</p>
            
            <p>La nuit enveloppa Paris.
            Les étoiles brillèrent dans le ciel.
            Indifférentes aux drames humains.
            Mais belles. Éternelles. Libres.</p>
            
            <p>Et dans un petit studio du 11ème arrondissement,
            une mère et sa fille dormaient,
            ensemble,
            paixibles,
            libres,
            enfin.</p>
            
            <p>Leur cœur battait,
            l'un contre l'autre,
            dans le silence de la nuit,
            dans la paix retrouvée,
            dans la vie choisie,
            dans l'amour vainqueur,
            dans la liberté conquise,
            dans la vérité acceptée,
            dans le bonheur simple
            d'être,
            enfin,
            soi-même.</p>
            
            <p>Et ça,
            rien ni personne
            ne pourrait jamais
            l'acheter.
            Le vendre.
            Le voler.
            Le détruire.</p>
            
            <p>Ça leur appartenait.
            À jamais.
            Pour toujours.
            Éternellement.</p>
            
            <p>Le cœur.
            Toujours le cœur.</p>
            
            <h3>FIN</h3> ` },
            // Ajoutez jusqu'au chapitre 25
        }
    },
    {
        id: 4,
        title: "Murmures Nocturnes",
        author: "Camille Bernard",
        genre: "mystery",
        cover: "images/3T.jpg",
        description: "Une enquête troublante.",
        chapters: 18,
        rating: 4.6,
        readers: 2100,
        favorite: false,
        pages: 9,
        novelChapters: {
            1: { title: "Chapitre 1: Disparition", content: "<p>Texte UNIQUE roman 4 chapitre 1</p>" },
            2: { title: "Chapitre 2: Investigation", content: "<p>Texte UNIQUE roman 4 chapitre 2</p>" },
            3: { title: "Chapitre 3: Indices", content: "<p>Texte UNIQUE roman 4 chapitre 3</p>" }
            // Ajoutez jusqu'au chapitre 18
        }
    },
    {
        id: 5,
        title: "Amour Éternel",
        author: "Julie Petit",
        genre: "romance",
        cover: "images/4T.jpg",
        description: "Une romance historique.",
        chapters: 22,
        rating: 4.7,
        readers: 2780,
        favorite: false,
        pages: 11,
        novelChapters: {
            1: { title: "Chapitre 1: Destin", content: "<p>Texte UNIQUE roman 5 chapitre 1</p>" },
            2: { title: "Chapitre 2: Passion", content: "<p>Texte UNIQUE roman 5 chapitre 2</p>" },
            3: { title: "Chapitre 3: Obstacles", content: "<p>Texte UNIQUE roman 5 chapitre 3</p>" }
            // Ajoutez jusqu'au chapitre 22
        }
    },
    {
        id: 6,
        title: "Le Mage Déchu",
        author: "Alexandre Moreau",
        genre: "fantasy",
        cover: "images/5T.jpg",
        description: "L'histoire d'un mage en quête.",
        chapters: 30,
        rating: 4.9,
        readers: 3450,
        favorite: false,
        pages: 15,
        novelChapters: {
            1: { title: "Chapitre 1: La chute", content: "<p>Texte UNIQUE roman 6 chapitre 1</p>" },
            2: { title: "Chapitre 2: Exil", content: "<p>Texte UNIQUE roman 6 chapitre 2</p>" },
            3: { title: "Chapitre 3: Quête", content: "<p>Texte UNIQUE roman 6 chapitre 3</p>" }
            // Ajoutez jusqu'au chapitre 30
        }
    }
];

// Vous pouvez supprimer l'ancien demoChapters global
// const demoChapters = {}; // À SUPPRIMER
// ==================== FONCTIONS UTILITAIRES ====================
function getGenreName(genre) {
    const genres = {
        'mystery': 'Mystère',
        'romance': 'Romance', 
        'fantasy': 'Fantasy'
    };
    return genres[genre] || genre;
}



// PAR CELLE-CI :
function getChapterContent(novelId, chapterNumber) {
    // Trouver le roman
    const novel = novels.find(n => n.id === novelId);
    
    if (!novel) {
        return {
            title: `Chapitre ${chapterNumber}`,
            content: `<p>Roman non trouvé...</p>`
        };
    }
    
    // Vérifier si le roman a ses propres chapitres
    if (novel.novelChapters && novel.novelChapters[chapterNumber]) {
        return novel.novelChapters[chapterNumber];
    }
    
    // Fallback : utiliser les chapitres génériques (pour compatibilité)
    if (demoChapters[chapterNumber]) {
        return demoChapters[chapterNumber];
    }
    
    // Fallback final
    return {
        title: `Chapitre ${chapterNumber}`,
        content: `<p>Contenu du chapitre ${chapterNumber} en cours de chargement...</p>`
    };
}


// ==================== INITIALISATION ====================
document.addEventListener('DOMContentLoaded', function() {
    if (isInitialized) return;
    isInitialized = true;
    
    novels = demoNovels.map(novel => ({
        ...novel,
        favorite: false // Initialiser à false
    }));
    
    // Récupérer les favoris depuis le localStorage
    updateFavoritesFromStorage();
    
    // Initialiser les composants
    const initFunctions = [
        renderNovels,
        updateFavoritesUI,
        setupAuth,
        setupModals,
        setupFilters,
        setupSubscription,
        setupReader,
        updateUserUI,
        setupEventListeners
    ];
    
    initFunctions.forEach(fn => {
        try {
            fn();
        } catch (error) {
            console.warn(`Erreur lors de l'initialisation de ${fn.name}:`, error);
        }
    });
    
    console.log('Application initialisée avec succès');
});

// ==================== ÉCOUTEURS D'ÉVÉNEMENTS ====================
function setupEventListeners() {
    // Menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Newsletter
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Navigation par ancres
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#accueil') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    if (navLinks && navActions) {
        const isHidden = navLinks.style.display === 'none' || navLinks.style.display === '';
        navLinks.style.display = isHidden ? 'flex' : 'none';
        navActions.style.display = isHidden ? 'flex' : 'none';
        
        // Ajuster pour mobile
        if (window.innerWidth <= 768) {
            if (isHidden) {
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '100%';
                navLinks.style.left = '0';
                navLinks.style.right = '0';
                navLinks.style.background = 'white';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                navLinks.style.zIndex = '1000';
            } else {
                navLinks.style = '';
            }
        }
    }
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    const input = this.querySelector('input[type="email"]');
    if (input && input.value) {
        showToast('Merci pour votre inscription à la newsletter !', 'success');
        input.value = '';
    }
}

// ==================== AUTHENTIFICATION ====================
function setupAuth() {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const heroSignup = document.getElementById('hero-signup');
    const authModal = document.getElementById('auth-modal');
    
    if (!authModal) {
        console.warn('Modal d\'authentification non trouvé');
        return;
    }
    
    const closeModal = authModal.querySelector('.close-modal');
    const authTabs = authModal.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const profileLink = document.getElementById('profile-link');

    // Ouvrir modal d'authentification
    [loginBtn, signupBtn, heroSignup].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                authModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            });
        }
    });

    // Fermer modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            authModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });
    }

    // Changer d'onglet
    if (authTabs.length > 0) {
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                // Mettre à jour les onglets actifs
                authTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Mettre à jour le titre
                const authTitle = document.getElementById('auth-title');
                if (authTitle) {
                    authTitle.textContent = tabName === 'login' ? 'Connexion' : 'Inscription';
                }
                
                // Afficher le bon formulaire
                if (loginForm && signupForm) {
                    if (tabName === 'login') {
                        loginForm.classList.remove('hidden');
                        signupForm.classList.add('hidden');
                    } else {
                        loginForm.classList.add('hidden');
                        signupForm.classList.remove('hidden');
                    }
                }
            });
        });
    }

    // Soumission connexion
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email');
            const password = document.getElementById('login-password');
            
            if (!email || !password) return;
            
            // Simulation de connexion
            const user = {
                name: email.value.split('@')[0] || 'Utilisateur',
                email: email.value,
                subscription: userSubscription
            };
            
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Mettre à jour l'UI
            updateUserUI();
            
            // Fermer le modal
            authModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            
            // Afficher message de bienvenue
            showToast('Connexion réussie !', 'success');
            
            // Réinitialiser le formulaire
            loginForm.reset();
        });
    }

    // Soumission inscription
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name');
            const email = document.getElementById('signup-email');
            const password = document.getElementById('signup-password');
            const confirm = document.getElementById('signup-confirm');
            
            if (!name || !email || !password || !confirm) return;
            
            if (password.value !== confirm.value) {
                showToast('Les mots de passe ne correspondent pas', 'error');
                return;
            }
            
            // Simulation d'inscription
            const user = {
                name: name.value,
                email: email.value,
                subscription: 'free'
            };
            
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            userSubscription = 'free';
            localStorage.setItem('userSubscription', 'free');
            
            // Mettre à jour l'UI
            updateUserUI();
            
            // Fermer le modal
            authModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            
            // Afficher message de bienvenue
            showToast(`Bienvenue ${name.value} !`, 'success');
            
            // Réinitialiser le formulaire
            signupForm.reset();
        });
    }

    // Gestion du profil
    if (profileLink) {
        profileLink.addEventListener('click', (e) => {
            if (!currentUser) {
                e.preventDefault();
                authModal.classList.remove('hidden');
            }
            // Note: dashboard.html n'existe pas encore, donc on ne redirige pas
        });
    }
}

// ==================== PUBLICITÉS ====================
function showAdBeforeNextPage() {
    return new Promise((resolve) => {
        if (userSubscription === 'premium') {
            resolve();
            return;
        }

        const adModal = document.getElementById('ad-modal');
        const skipBtn = document.getElementById('skip-ad');
        
        if (!adModal || !skipBtn) {
            resolve();
            return;
        }

        let countdown = 5;
        let countdownInterval;

        // Mettre à jour le compte à rebours
        const updateCountdown = () => {
            const adCountdown = document.getElementById('ad-countdown');
            const skipCountdown = document.getElementById('skip-countdown');
            
            if (adCountdown) adCountdown.textContent = countdown;
            if (skipCountdown) skipCountdown.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                skipBtn.disabled = false;
                skipBtn.textContent = 'Continuer';
            }
            countdown--;
        };

        // Afficher la pub
        adModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Démarrer le compte à rebours
        countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();

        // Gestion du bouton "Passer"
        const skipHandler = () => {
            clearInterval(countdownInterval);
            adModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            skipBtn.removeEventListener('click', skipHandler);
            resolve();
        };
        
        skipBtn.addEventListener('click', skipHandler);

        // Fermeture automatique
        setTimeout(() => {
            clearInterval(countdownInterval);
            adModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
            skipBtn.removeEventListener('click', skipHandler);
            resolve();
        }, 6000);
    });
}

// ==================== GESTION DES ROMANS ====================
function renderNovels(filter = 'all') {
    const container = document.getElementById('novels-container');
    if (!container) return;

    const filteredNovels = filter === 'all' 
        ? novels 
        : novels.filter(novel => novel.genre === filter);

    container.innerHTML = filteredNovels.map(novel => {
        const isFavorite = favorites.includes(novel.id);
        return `
            <div class="novel-card" data-id="${novel.id}">
                <div class="novel-cover">
                    <img src="${novel.cover}" alt="${novel.title}" loading="lazy">
                    <div class="novel-badge">${getGenreName(novel.genre)}</div>
                    <button class="novel-favorite ${isFavorite ? 'active' : ''}" 
                            data-id="${novel.id}" 
                            title="${isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                        <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                <div class="novel-info">
                    <h3 class="novel-title">${novel.title}</h3>
                    <p class="novel-author">
                        <i class="fas fa-user-pen"></i> ${novel.author}
                    </p>
                    <p class="novel-description">${novel.description}</p>
                    <div class="novel-stats">
                        <span><i class="fas fa-star"></i> ${novel.rating}</span>
                        <span><i class="fas fa-book-open"></i> ${novel.chapters} chapitres</span>
                        <span><i class="fas fa-eye"></i> ${novel.readers.toLocaleString()}</span>
                    </div>
                    <button class="btn-read" data-id="${novel.id}">
                        <i class="fas fa-play"></i> Lire maintenant
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Ajouter les événements
    attachNovelEvents();
}

function attachNovelEvents() {
    document.querySelectorAll('.novel-favorite').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const novelId = parseInt(btn.dataset.id);
            toggleFavorite(novelId);
        });
    });

    document.querySelectorAll('.btn-read').forEach(btn => {
        btn.addEventListener('click', () => {
            const novelId = parseInt(btn.dataset.id);
            startReading(novelId);
        });
    });
}

// ==================== FAVORIS ====================
function toggleFavorite(novelId) {
    if (!currentUser) {
        showToast('Connectez-vous pour ajouter aux favoris', 'info');
        const authModal = document.getElementById('auth-modal');
        if (authModal) authModal.classList.remove('hidden');
        return;
    }

    const novel = novels.find(n => n.id === novelId);
    if (!novel) return;

    const index = favorites.indexOf(novelId);
    
    if (index === -1) {
        // Ajouter aux favoris
        favorites.push(novelId);
        novel.favorite = true;
        showToast('Ajouté aux favoris', 'success');
    } else {
        // Retirer des favoris
        favorites.splice(index, 1);
        novel.favorite = false;
        showToast('Retiré des favoris', 'info');
    }

    // Sauvegarder
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Mettre à jour l'UI
    updateFavoritesUI();
    
    // Re-render les romans pour mettre à jour les icônes
    const activeFilter = document.querySelector('.filter-btn.active');
    renderNovels(activeFilter ? activeFilter.dataset.filter : 'all');
    
    // Mettre à jour le bouton favori dans le lecteur si ouvert
    updateReaderFavoriteButton();
}

function updateFavoritesFromStorage() {
    novels.forEach(novel => {
        novel.favorite = favorites.includes(novel.id);
    });
}

function updateFavoritesUI() {
    const container = document.getElementById('favorites-container');
    const subtitle = document.getElementById('favorites-subtitle');
    
    if (!container || !subtitle) return;

    if (!currentUser) {
        container.innerHTML = `
            <div class="empty-favorites">
                <i class="fas fa-user-lock"></i>
                <h3>Connectez-vous</h3>
                <p>Connectez-vous pour voir vos romans favoris</p>
                <button class="btn-primary" id="login-from-favorites">
                    <i class="fas fa-sign-in-alt"></i> Se connecter
                </button>
            </div>
        `;
        
        // Attacher l'événement après l'insertion
        setTimeout(() => {
            const loginBtn = document.getElementById('login-from-favorites');
            if (loginBtn) {
                loginBtn.addEventListener('click', () => {
                    const authModal = document.getElementById('auth-modal');
                    if (authModal) authModal.classList.remove('hidden');
                });
            }
        }, 0);
        
        return;
    }

    const favoriteNovels = novels.filter(novel => favorites.includes(novel.id));

    if (favoriteNovels.length === 0) {
        container.innerHTML = `
            <div class="empty-favorites">
                <i class="fas fa-heart"></i>
                <h3>Aucun favori</h3>
                <p>Ajoutez des romans à vos favoris pour les retrouver ici</p>
                <a href="#bibliotheque" class="btn-primary">
                    <i class="fas fa-book"></i> Découvrir des romans
                </a>
            </div>
        `;
        subtitle.textContent = '0 roman favori';
    } else {
        container.innerHTML = favoriteNovels.map(novel => `
            <div class="novel-card" data-id="${novel.id}">
                <div class="novel-cover">
                    <img src="${novel.cover}" alt="${novel.title}" loading="lazy">
                    <div class="novel-badge">Favori</div>
                    <button class="novel-favorite active" data-id="${novel.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="novel-info">
                    <h3 class="novel-title">${novel.title}</h3>
                    <p class="novel-author">
                        <i class="fas fa-user-pen"></i> ${novel.author}
                    </p>
                    <p class="novel-description">${novel.description}</p>
                    <div class="novel-stats">
                        <span><i class="fas fa-star"></i> ${novel.rating}</span>
                        <span><i class="fas fa-book-open"></i> ${novel.chapters} chapitres</span>
                    </div>
                    <button class="btn-read" data-id="${novel.id}">
                        <i class="fas fa-play"></i> Continuer la lecture
                    </button>
                </div>
            </div>
        `).join('');
        
        subtitle.textContent = `${favoriteNovels.length} roman${favoriteNovels.length > 1 ? 's' : ''} favori${favoriteNovels.length > 1 ? 's' : ''}`;
        
        // Attacher les événements après l'insertion
        setTimeout(() => {
            attachNovelEvents();
        }, 0);
    }
}

// ==================== LECTEUR ====================
function setupReader() {
    const readerBack = document.getElementById('reader-back');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const readerFavoriteBtn = document.getElementById('reader-favorite-btn');

    if (readerBack) {
        readerBack.addEventListener('click', () => {
            document.getElementById('reader-section').classList.add('hidden');
            document.body.style.overflow = 'auto';
        });
    }

    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', goToPreviousPage);
    }

    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', goToNextPage);
    }

    if (readerFavoriteBtn) {
        readerFavoriteBtn.addEventListener('click', () => {
            if (currentNovel) {
                toggleFavorite(currentNovel.id);
            }
        });
    }
}

async function startReading(novelId) {
    const novel = novels.find(n => n.id === novelId);
    if (!novel) {
        showToast('Roman non trouvé', 'error');
        return;
    }

    currentNovel = novel;
    currentPage = 1;
    totalPages = novel.pages || 5;

    // Mettre à jour l'interface du lecteur
    const readerTitle = document.getElementById('reader-novel-title');
    const chapter1Title = document.getElementById('chapter1-title');
    const chapter1Content = document.getElementById('chapter1-content');
    const chapter2Title = document.getElementById('chapter2-title');
    const chapter2Content = document.getElementById('chapter2-content');
    
    if (readerTitle) readerTitle.textContent = novel.title;
    
    // Charger les chapitres
    const chapter1 = getChapterContent(novelId, 1);
    const chapter2 = getChapterContent(novelId, 2);
    
    if (chapter1Title) chapter1Title.textContent = chapter1.title;
    if (chapter1Content) chapter1Content.innerHTML = chapter1.content;
    if (chapter2Title) chapter2Title.textContent = chapter2.title;
    if (chapter2Content) chapter2Content.innerHTML = chapter2.content;
    
    updateReaderUI();
    updateReaderFavoriteButton();

    // Afficher le lecteur
    const readerSection = document.getElementById('reader-section');
    if (readerSection) {
        readerSection.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Faire défiler vers le haut
    window.scrollTo(0, 0);
}

function updateReaderUI() {
    if (!currentNovel) return;

    // Mettre à jour la pagination
    const elements = {
        'current-page-num': currentPage,
        'total-pages-num': totalPages,
        'page-current': currentPage,
        'page-total': totalPages
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
    
    // Calculer les chapitres affichés (2 par page)
    const startChapter = (currentPage - 1) * 2 + 1;
    const endChapter = Math.min(startChapter + 1, currentNovel.chapters);
    const chaptersRange = document.getElementById('current-chapters-range');
    if (chaptersRange) {
        chaptersRange.textContent = `${startChapter}-${endChapter}`;
    }
    
    // Charger les chapitres correspondants
    const chapter1 = getChapterContent(currentNovel.id, startChapter);
    const chapter2 = getChapterContent(currentNovel.id, endChapter);
    
    const chapter1Title = document.getElementById('chapter1-title');
    const chapter1Content = document.getElementById('chapter1-content');
    const chapter2Title = document.getElementById('chapter2-title');
    const chapter2Content = document.getElementById('chapter2-content');
    
    if (chapter1Title) chapter1Title.textContent = chapter1.title;
    if (chapter1Content) chapter1Content.innerHTML = chapter1.content;
    if (chapter2Title && chapter2) chapter2Title.textContent = chapter2.title;
    if (chapter2Content && chapter2) chapter2Content.innerHTML = chapter2.content;
    
    // Gérer les boutons de navigation
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    
    // Afficher/masquer la note sur les pubs
    const adNotice = document.getElementById('ad-notice-box');
    if (adNotice) {
        if (userSubscription === 'free' && currentPage < totalPages) {
            adNotice.classList.remove('hidden');
        } else {
            adNotice.classList.add('hidden');
        }
    }
    
    // Mettre à jour le badge de pub
    const adBadge = document.querySelector('.ad-badge');
    if (adBadge) {
        adBadge.style.display = userSubscription === 'free' && currentPage < totalPages ? 'flex' : 'none';
    }
}

function updateReaderFavoriteButton() {
    const btn = document.getElementById('reader-favorite-btn');
    if (!btn || !currentNovel) return;

    const isFavorite = favorites.includes(currentNovel.id);
    const icon = btn.querySelector('i');
    
    if (icon) {
        if (isFavorite) {
            icon.className = 'fas fa-heart';
            btn.title = 'Retirer des favoris';
            btn.style.color = 'var(--danger-color)';
        } else {
            icon.className = 'far fa-heart';
            btn.title = 'Ajouter aux favoris';
            btn.style.color = '';
        }
    }
}

async function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        updateReaderUI();
        window.scrollTo(0, 0);
    }
}

async function goToNextPage() {
    if (currentPage < totalPages) {
        // Vérifier si l'utilisateur a un abonnement premium
        if (userSubscription === 'free') {
            // Afficher une pub avant de passer à la page suivante
            try {
                await showAdBeforeNextPage();
            } catch (error) {
                console.warn('Erreur lors de l\'affichage de la pub:', error);
            }
        }
        
        currentPage++;
        updateReaderUI();
        window.scrollTo(0, 0);
    }
}

// ==================== FILTRES ====================
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Mettre à jour le bouton actif
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filtrer les romans
            const filter = btn.dataset.filter;
            renderNovels(filter);
        });
    });
}

// ==================== ABONNEMENT ====================
function setupSubscription() {
    const freeBtn = document.getElementById('select-free');
    const premiumBtn = document.getElementById('select-premium');

    if (freeBtn) {
        freeBtn.addEventListener('click', () => {
            if (!currentUser) {
                showToast('Connectez-vous pour choisir un abonnement', 'info');
                const authModal = document.getElementById('auth-modal');
                if (authModal) authModal.classList.remove('hidden');
                return;
            }
            
            userSubscription = 'free';
            localStorage.setItem('userSubscription', 'free');
            showToast('Abonnement gratuit activé', 'success');
            updateUserUI();
        });
    }

    if (premiumBtn) {
        premiumBtn.addEventListener('click', () => {
            if (!currentUser) {
                showToast('Connectez-vous pour choisir un abonnement', 'info');
                const authModal = document.getElementById('auth-modal');
                if (authModal) authModal.classList.remove('hidden');
                return;
            }
            
            // Simuler un paiement
            showToast('Redirection vers le paiement...', 'info');
            
            // Après 2 secondes, simuler un paiement réussi
            setTimeout(() => {
                userSubscription = 'premium';
                localStorage.setItem('userSubscription', 'premium');
                showToast('Abonnement Premium activé !', 'success');
                updateUserUI();
                
                // Mettre à jour l'UI du lecteur si ouvert
                updateReaderUI();
            }, 2000);
        });
    }
}

// ==================== UTILISATEUR ====================
function updateUserUI() {
    const userName = document.getElementById('user-name');
    const userMenu = document.querySelector('.user-menu');
    
    if (currentUser) {
        // Mettre à jour le nom
        if (userName) {
            userName.textContent = currentUser.name;
        }
        
        // Mettre à jour le menu utilisateur
        if (userMenu) {
            userMenu.innerHTML = `
                <span class="user-greeting">Bonjour, ${currentUser.name}</span>
                <button class="btn-logout" id="logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Déconnexion
                </button>
            `;
            
            // Attacher l'événement après l'insertion
            setTimeout(() => {
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', logout);
                }
            }, 0);
        }
        
        // Mettre à jour les favoris
        updateFavoritesUI();
    } else {
        if (userName) userName.textContent = 'Compte';
        if (userMenu) {
            userMenu.innerHTML = `
                <button class="btn-login" id="login-btn">Connexion</button>
                <button class="btn-signup" id="signup-btn">Inscription</button>
            `;
            
            // Attacher les événements après l'insertion
            setTimeout(() => {
                const loginBtn = document.getElementById('login-btn');
                const signupBtn = document.getElementById('signup-btn');
                const authModal = document.getElementById('auth-modal');
                
                if (loginBtn && authModal) {
                    loginBtn.addEventListener('click', () => {
                        authModal.classList.remove('hidden');
                    });
                }
                
                if (signupBtn && authModal) {
                    signupBtn.addEventListener('click', () => {
                        authModal.classList.remove('hidden');
                    });
                }
            }, 0);
        }
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserUI();
    showToast('Déconnexion réussie', 'info');
    
    // Fermer le lecteur si ouvert
    const readerSection = document.getElementById('reader-section');
    if (readerSection) {
        readerSection.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// ==================== MODALS ====================
function setupModals() {
    // Fermer les modals en cliquant en dehors
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Fermer avec ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            });
        }
    });
}

// ==================== SERVICE WORKER (PWA) ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker enregistré avec succès:', registration.scope);
            })
            .catch(error => {
                console.log('Échec d\'enregistrement du Service Worker:', error);
            });
    });
}

// ==================== GESTION DES ERREURS ====================
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesse rejetée non gérée:', e.reason);
});

// ==================== EXPORT POUR LES TESTS ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        toggleFavorite,
        startReading,
        updateUserUI,
        logout
    };
}
// Gestion des abonnements
class SubscriptionManager {
    constructor() {
      this.plans = {
        basic: {
          name: 'Basique',
          price: 0,
          features: ['Accès aux 3 premiers chapitres', 'Publicités réduites', '1 nouvelle par semaine']
        },
        premium: {
          name: 'Premium',
          price: 9.99,
          features: ['Accès complet à tous les romans', 'Sans publicités', 'Nouvelles exclusives', 'Support prioritaire', 'Téléchargement hors-ligne']
        },
        vip: {
          name: 'VIP',
          price: 14.99,
          features: ['Tout inclus dans Premium', 'Rencontres avec les auteurs', 'Contenu pré-publication', 'Personnalisation avancée']
        }
      };
    }
  
    async processSubscription(planId, paymentMethod) {
      try {
        // Simulation de paiement
        const user = JSON.parse(localStorage.getItem('ted_user') || '{}');
        
        const subscription = {
          plan: planId,
          price: this.plans[planId].price,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
          status: 'active',
          features: this.plans[planId].features
        };
  
        user.subscription = subscription;
        localStorage.setItem('ted_user', JSON.stringify(user));
        
        // Mettre à jour l'interface
        this.updateUI();
        
        // Envoyer la confirmation
        await this.sendConfirmationEmail(user.email, subscription);
        
        return { success: true, subscription };
      } catch (error) {
        console.error('Erreur lors de l\'abonnement:', error);
        return { success: false, error: error.message };
      }
    }
  
    updateUI() {
      const user = JSON.parse(localStorage.getItem('ted_user') || '{}');
      const premiumElements = document.querySelectorAll('.premium-content');
      const adsContainer = document.getElementById('ads-container');
      
     const isPremium = user.subscription && (user.subscription.plan === 'premium' || user.subscription.plan === 'vip'); {
        // Masquer les publicités
        if (adsContainer) adsContainer.style.display = 'none';
        
        // Débloquer le contenu premium
        premiumElements.forEach(el => {
          el.classList.remove('locked');
          el.innerHTML = el.innerHTML.replace('🔒', '⭐');
        });
        
        // Mettre à jour le badge
        const badge = document.getElementById('user-badge');
        if (badge) {
          badge.textContent = 'PREMIUM';
          badge.className = 'badge premium';
        }
      }
    }
    
  
    async sendConfirmationEmail(email, subscription) {
      // Simulation d'envoi d'email
      console.log(`Email envoyé à ${email} pour confirmation d'abonnement`);
      return true;
    }
  }
  
  // Système de lecture avancé
  class ReadingSystem {
    constructor() {
      this.currentChapter = 0;
      this.readingProgress = {};
      this.fontSize = 16;
      this.theme = 'light';
      this.loadPreferences();
    }
  
    loadPreferences() {
      const prefs = JSON.parse(localStorage.getItem('reading_prefs') || '{}');
      this.fontSize = prefs.fontSize || 16;
      this.theme = prefs.theme || 'light';
      this.readingProgress = JSON.parse(localStorage.getItem('reading_progress') || '{}');
    }
  
    savePreferences() {
      localStorage.setItem('reading_prefs', JSON.stringify({
        fontSize: this.fontSize,
        theme: this.theme
      }));
      localStorage.setItem('reading_progress', JSON.stringify(this.readingProgress));
    }
  
    updateProgress(novelId, chapterId, position) {
      if (!this.readingProgress[novelId]) {
        this.readingProgress[novelId] = {};
      }
      this.readingProgress[novelId][chapterId] = {
        position,
        timestamp: Date.now(),
        completed: position > 0.95
      };
      this.savePreferences();
    }
  
    increaseFontSize() {
      this.fontSize = Math.min(this.fontSize + 1, 24);
      this.applyStyles();
    }
  
    decreaseFontSize() {
      this.fontSize = Math.max(this.fontSize - 1, 12);
      this.applyStyles();
    }
  
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'sepia';
      this.applyStyles();
    }
  
    applyStyles() {
      const content = document.getElementById('novel-content');
      if (content) {
        content.style.fontSize = `${this.fontSize}px`;
        content.className = `reading-content theme-${this.theme}`;
      }
      this.savePreferences();
    }
  }
  
  // Gestion de l'historique de lecture
function addReadingActivity(novelTitle, chapter, progress) {
    const activity = JSON.parse(localStorage.getItem('reading_activity') || '[]');
    
    activity.push({
        title: novelTitle,
        chapter: chapter,
        progress: progress,
        timestamp: new Date().toISOString()
    });
    
    // Garder seulement les 100 dernières activités
    if (activity.length > 100) {
        activity.splice(0, activity.length - 100);
    }
    
    localStorage.setItem('reading_activity', JSON.stringify(activity));
    
    // Mettre à jour les statistiques
    updateReadingStats();
}

function updateReadingStats() {
    const stats = JSON.parse(localStorage.getItem('reading_stats') || '{}');
    const activity = JSON.parse(localStorage.getItem('reading_activity') || '[]');
    
    // Compter le nombre de romans uniques lus
    const uniqueBooks = new Set(activity.map(item => item.title)).size;
    stats.totalBooks = uniqueBooks;
    
    // Calculer le temps total de lecture (estimation : 5 minutes par activité)
    stats.totalReadingTime = activity.length * 5;
    
    // Calculer la série de lecture
    stats.currentStreak = calculateReadingStreak();
    
    localStorage.setItem('reading_stats', JSON.stringify(stats));
}

function calculateReadingStreak() {
    const activity = JSON.parse(localStorage.getItem('reading_activity') || '[]');
    if (activity.length === 0) return 0;
    
    // Trier par date
    const dates = activity
        .map(item => new Date(item.timestamp).toDateString())
        .sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 1;
    let currentDate = new Date(dates[0]);
    
    for (let i = 1; i < dates.length; i++) {
        const previousDate = new Date(dates[i]);
        const diffTime = Math.abs(currentDate - previousDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            streak++;
            currentDate = previousDate;
        } else {
            break;
        }
    }
    
    return streak;
}

// Fonction pour sauvegarder les favoris
function saveFavorite(novelId, novelTitle) {
    const favorites = JSON.parse(localStorage.getItem('user_favorites') || '[]');
    const user = JSON.parse(localStorage.getItem('ted_user') || '{}');
    
    // Vérifier la limite des favoris (10 pour gratuit, illimité pour premium)
    const maxFavorites = (user.subscription && (user.subscription.plan === 'premium' || user.subscription.plan === 'vip')) 
        ? Infinity 
        : 10;
    
    if (favorites.length >= maxFavorites && !favorites.find(fav => fav.id === novelId)) {
        alert(`Limite de favoris atteinte (${maxFavorites}). Passez à Premium pour un nombre illimité !`);
        return false;
    }
    
    // Ajouter ou retirer des favoris
    const existingIndex = favorites.findIndex(fav => fav.id === novelId);
    
    if (existingIndex > -1) {
        favorites.splice(existingIndex, 1);
    } else {
        favorites.push({
            id: novelId,
            title: novelTitle,
            addedAt: new Date().toISOString()
        });
    }
    
    localStorage.setItem('user_favorites', JSON.stringify(favorites));
    return existingIndex === -1; // Retourne true si ajouté, false si retiré
}

// Vérifier si connecté
function checkAuth() {
    const user = localStorage.getItem('ted_user');
    if (!user) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Gestion de la session
function updateLastLogin() {
    const user = JSON.parse(localStorage.getItem('ted_user') || '{}');
    user.lastLogin = new Date().toISOString();
    localStorage.setItem('ted_user', JSON.stringify(user));
}
// Gestion de l'authentification et des sessions
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('ted_user') || '{}');
    
    // Éléments à mettre à jour
    const profileLink = document.getElementById('profile-link');
    const userName = document.getElementById('user-name');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const heroSignup = document.getElementById('hero-signup');
    
    if (user && user.email) {
        // Utilisateur connecté
        console.log('Utilisateur connecté:', user.email);
        
        // Mettre à jour la navigation
        if (profileLink) {
            profileLink.href = 'profile.html';
        }
        
        if (userName) {
            userName.textContent = user.name ? user.name.split(' ')[0] : 'Mon Profil';
        }
        
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Mon Profil';
            loginBtn.onclick = function(e) {
                e.preventDefault();
                window.location.href = 'profile.html';
            };
        }
        
        if (signupBtn) {
            signupBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Déconnexion';
            signupBtn.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        }
        
        if (heroSignup) {
            heroSignup.innerHTML = '<i class="fas fa-user"></i> Mon Profil';
            heroSignup.onclick = function(e) {
                e.preventDefault();
                window.location.href = 'profile.html';
            };
        }
    } else {
        // Utilisateur non connecté
        console.log('Utilisateur non connecté');
        
        if (loginBtn) {
            loginBtn.innerHTML = 'Connexion';
            loginBtn.onclick = function(e) {
                e.preventDefault();
                showAuthModal('login');
            };
        }
        
        if (signupBtn) {
            signupBtn.innerHTML = 'Inscription';
            signupBtn.onclick = function(e) {
                e.preventDefault();
                showAuthModal('signup');
            };
        }
        
        if (heroSignup) {
            heroSignup.innerHTML = '<i class="fas fa-user-plus"></i> Commencer gratuitement';
            heroSignup.onclick = function(e) {
                e.preventDefault();
                showAuthModal('signup');
            };
        }
    }
}

// Fonction de déconnexion
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        const user = JSON.parse(localStorage.getItem('ted_user') || '{}');
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('ted_user', JSON.stringify(user));
        
        // Rediriger vers la page d'accueil
        window.location.href = 'index.html';
    }
}

// Fonction pour afficher le modal d'authentification
function showAuthModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginTab = document.querySelector('[data-tab="login"]');
    const signupTab = document.querySelector('[data-tab="signup"]');
    const authTitle = document.getElementById('auth-title');
    
    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        authTitle.textContent = 'Connexion';
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        loginTab.classList.remove('active');
        signupTab.classList.add('active');
        authTitle.textContent = 'Inscription';
    }
    
    modal.classList.remove('hidden');
}

// Fonction pour fermer les modals
function closeModals() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('ad-modal').classList.add('hidden');
}

// Fonction d'inscription (déjà existante mais mise à jour)
function signup(name, email, password) {
    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUsers = JSON.parse(localStorage.getItem('ted_users') || '[]');
        const userExists = existingUsers.some(user => user.email === email);
        
        if (userExists) {
            throw new Error('Un compte avec cet email existe déjà');
        }
        
        // Créer le nouvel utilisateur
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password, // Note: En production, il faut hacher le mot de passe
            joinedDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            subscription: null,
            preferences: {
                theme: 'light',
                fontSize: 16,
                notifications: true
            }
        };
        
        // Sauvegarder l'utilisateur
        existingUsers.push(newUser);
        localStorage.setItem('ted_users', JSON.stringify(existingUsers));
        
        // Connecter automatiquement l'utilisateur
        localStorage.setItem('ted_user', JSON.stringify(newUser));
        
        return {
            success: true,
            user: newUser
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Fonction de connexion
function login(email, password) {
    try {
        const users = JSON.parse(localStorage.getItem('ted_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            throw new Error('Email ou mot de passe incorrect');
        }
        
        // Mettre à jour la dernière connexion
        user.lastLogin = new Date().toISOString();
        localStorage.setItem('ted_user', JSON.stringify(user));
        
        // Mettre à jour dans la liste des utilisateurs
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex > -1) {
            users[userIndex] = user;
            localStorage.setItem('ted_users', JSON.stringify(users));
        }
        
        return {
            success: true,
            user: user
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Vérifier l'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est connecté
    checkAuth();
    
    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            const result = login(email, password);
            
            if (result.success) {
                alert('Connexion réussie !');
                closeModals();
                checkAuth(); // Mettre à jour l'interface
                
                // Rediriger vers la page profil ou rafraîchir
                if (window.location.pathname.includes('profile.html')) {
                    window.location.reload();
                }
            } else {
                alert('Erreur: ' + result.error);
            }
        });
    }
    
    // Gestion du formulaire d'inscription
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm').value;
            
            // Validation
            if (password !== confirmPassword) {
                alert('Les mots de passe ne correspondent pas');
                return;
            }
            
            if (password.length < 6) {
                alert('Le mot de passe doit contenir au moins 6 caractères');
                return;
            }
            
            const result = signup(name, email, password);
            
            if (result.success) {
                alert('Inscription réussie ! Bienvenue sur TED ROMANS');
                closeModals();
                checkAuth(); // Mettre à jour l'interface
                
                // Rediriger vers la page profil
                window.location.href = 'profile.html';
            } else {
                alert('Erreur: ' + result.error);
            }
        });
    }
    
    // Gestion des onglets d'authentification
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabType = this.dataset.tab;
            showAuthModal(tabType);
        });
    });
    
    // Fermer les modals
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    // Fermer modal en cliquant en dehors
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModals();
            }
        });
    });
});
// ==================== SYNCHRONISATION DES DONNÉES ====================

// Fonction pour synchroniser l'utilisateur entre toutes les pages
function syncUserData() {
    // Récupérer l'utilisateur courant
    const currentUser = JSON.parse(localStorage.getItem('ted_user') || '{}');
    
    if (currentUser.id) {
        // Trouver la version la plus récente dans la liste des utilisateurs
        const users = JSON.parse(localStorage.getItem('ted_users') || '[]');
        const latestUser = users.find(u => u.id === currentUser.id);
        
        if (latestUser && latestUser.updatedAt > currentUser.updatedAt) {
            // Mettre à jour l'utilisateur courant avec les données les plus récentes
            localStorage.setItem('ted_user', JSON.stringify(latestUser));
            console.log('Utilisateur synchronisé avec la version la plus récente');
            return latestUser;
        }
    }
    
    return currentUser;
}

// Fonction pour mettre à jour le nom dans la navigation
function updateUserNameInNav() {
    const user = JSON.parse(localStorage.getItem('ted_user') || '{}');
    const userNameElement = document.getElementById('user-name');
    
    if (userNameElement && user.name) {
        // Prendre seulement le prénom
        const firstName = user.name.split(' ')[0];
        userNameElement.textContent = firstName;
    }
}
// Écouter les changements dans localStorage pour synchroniser en temps réel
window.addEventListener('storage', function(e) {
    if (e.key === 'ted_user') {
        console.log('Données utilisateur mises à jour, synchronisation...');
        updateUserInterface();
    }
});

// Synchroniser aussi quand la page devient visible (quand on revient d'une autre page)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        updateUserInterface();
    }
});

// Synchroniser quand la page se charge
document.addEventListener('DOMContentLoaded', function() {
    updateUserInterface();
});