(function() {
    'use strict';
    
    const CONFIG = {
        MATRIX_INTERVAL: 50,
        MATRIX_FONT_SIZE: 14,
        ANIMATION_DURATION: 300
    };
    
    const DOM = {
        el: (selector) => document.querySelector(selector),
        all: (selector) => document.querySelectorAll(selector),
        create: (tag) => document.createElement(tag),
        setText: (el, text) => { el.textContent = text; return el; },
        addClass: (el, ...classes) => { el.classList.add(...classes); return el; },
        removeClass: (el, ...classes) => { el.classList.remove(...classes); return el; },
        setAttr: (el, attr, value) => { el.setAttribute(attr, value); return el; }
    };
    
    const MatrixBackground = {
        canvas: null,
        ctx: null,
        columns: [],
        fontSize: CONFIG.MATRIX_FONT_SIZE,
        
        words: [
            'root', 'admin', 'access', 'system', 'network', 'security',
            'cyber', 'hack', 'exploit', 'payload', 'shell', 'kernel',
            'firewall', 'proxy', 'tunnel', 'encrypt', 'decrypt', 'cipher',
            'protocol', 'packet', 'socket', 'buffer', 'overflow', 'injection',
            'authentication', 'authorization', 'privilege', 'escalation',
            'penetration', 'testing', 'vulnerability', 'assessment', 'audit'
        ],
        
        init: function() {
            this.canvas = DOM.el('#matrix-bg');
            if (!this.canvas) return;
            
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            this.startAnimation();
            
            window.addEventListener('resize', () => this.resize());
        },
        
        resize: function() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            const columnCount = Math.floor(this.canvas.width / this.fontSize);
            this.columns = [];
            for (let i = 0; i < columnCount; i++) {
                this.columns[i] = Math.random() * this.canvas.height / this.fontSize;
            }
        },
        
        draw: function() {
            this.ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = this.fontSize + 'px monospace';
            
            for (let i = 0; i < this.columns.length; i++) {
                const word = this.words[Math.floor(Math.random() * this.words.length)];
                const char = Math.random() > 0.7 ? word : String.fromCharCode(0x30A0 + Math.random() * 96);
                
                this.ctx.fillText(char, i * this.fontSize, this.columns[i] * this.fontSize);
                
                if (this.columns[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                    this.columns[i] = 0;
                }
                this.columns[i]++;
            }
        },
        
        startAnimation: function() {
            setInterval(() => this.draw(), CONFIG.MATRIX_INTERVAL);
        }
    };
    
    const Navigation = {
        toggle: null,
        navLinks: null,
        isOpen: false,
        
        init: function() {
            this.toggle = DOM.el('.nav-toggle');
            this.navLinks = DOM.el('.nav-links');
            
            if (this.toggle && this.navLinks) {
                this.toggle.addEventListener('click', () => this.handleToggle());
                
                DOM.all('.nav-links a').forEach(link => {
                    link.addEventListener('click', () => this.close());
                });
                
                document.addEventListener('click', (e) => {
                    if (this.isOpen && !this.navLinks.contains(e.target) && !this.toggle.contains(e.target)) {
                        this.close();
                    }
                });
            }
        },
        
        handleToggle: function() {
            this.isOpen = !this.isOpen;
            DOM.toggleClass(this.navLinks, 'active', this.isOpen);
            DOM.toggleClass(this.toggle, 'active', this.isOpen);
            DOM.setAttr(this.toggle, 'aria-expanded', this.isOpen);
        },
        
        close: function() {
            this.isOpen = false;
            DOM.removeClass(this.navLinks, 'active');
            DOM.removeClass(this.toggle, 'active');
            DOM.setAttr(this.toggle, 'aria-expanded', 'false');
        }
    };
    
    const CookieConsent = {
        cookieName: 'cookie_consent',
        storage: null,
        
        init: function() {
            this.storage = this.getStorage();
            if (!this.storage) {
                this.showBanner();
            }
        },
        
        getStorage: function() {
            try {
                return localStorage.getItem(this.cookieName);
            } catch (e) {
                return null;
            }
        },
        
        setStorage: function(data) {
            try {
                localStorage.setItem(this.cookieName, JSON.stringify(data));
            } catch (e) {
                console.warn('LocalStorage not available');
            }
        },
        
        createBanner: function() {
            const banner = DOM.create('div');
            banner.id = 'cookie-banner';
            banner.className = 'cookie-banner';
            DOM.setAttr(banner, 'role', 'dialog');
            DOM.setAttr(banner, 'aria-label', 'Consentimento de cookies');
            
            const content = DOM.create('div');
            content.className = 'cookie-content';
            
            const textDiv = DOM.create('div');
            textDiv.className = 'cookie-text';
            
            const h3 = DOM.create('h3');
            h3.textContent = '🍪 Utilizamos Cookies';
            
            const p = DOM.create('p');
            p.textContent = 'Este site utiliza cookies essenciais para funcionamento e cookies de preferência. Clique em "Aceitar" para permitir todos os cookies ou "Personalizar" para gerir as suas preferências. ';
            
            const link = DOM.create('a');
            link.href = 'cookies.html';
            link.textContent = 'Saiba mais sobre cookies';
            
            p.appendChild(link);
            textDiv.appendChild(h3);
            textDiv.appendChild(p);
            
            const buttons = DOM.create('div');
            buttons.className = 'cookie-buttons';
            
            const btnAccept = DOM.create('button');
            btnAccept.className = 'btn-accept';
            btnAccept.textContent = 'Aceitar';
            btnAccept.addEventListener('click', () => this.acceptAll());
            
            const btnReject = DOM.create('button');
            btnReject.className = 'btn-reject';
            btnReject.textContent = 'Rejeitar';
            btnReject.addEventListener('click', () => this.rejectAll());
            
            const btnSettings = DOM.create('button');
            btnSettings.className = 'btn-settings';
            btnSettings.textContent = 'Personalizar';
            btnSettings.addEventListener('click', () => this.showPreferences());
            
            buttons.appendChild(btnAccept);
            buttons.appendChild(btnReject);
            buttons.appendChild(btnSettings);
            
            content.appendChild(textDiv);
            content.appendChild(buttons);
            banner.appendChild(content);
            
            return banner;
        },
        
        showBanner: function() {
            if (DOM.el('#cookie-banner')) return;
            
            const banner = this.createBanner();
            document.body.appendChild(banner);
            
            requestAnimationFrame(() => {
                DOM.addClass(banner, 'show');
            });
        },
        
        hideBanner: function() {
            const banner = DOM.el('#cookie-banner');
            if (banner) {
                DOM.removeClass(banner, 'show');
                setTimeout(() => banner.remove(), CONFIG.ANIMATION_DURATION);
            }
        },
        
        acceptAll: function() {
            this.setStorage({
                essential: true,
                preferences: true,
                analytics: true,
                timestamp: Date.now()
            });
            this.hideBanner();
        },
        
        rejectAll: function() {
            this.setStorage({
                essential: true,
                preferences: false,
                analytics: false,
                timestamp: Date.now()
            });
            this.hideBanner();
        },
        
        createPreferencesModal: function() {
            const current = JSON.parse(this.storage || '{}');
            
            const modal = DOM.create('div');
            modal.id = 'cookie-preferences-modal';
            modal.className = 'cookie-modal';
            
            const content = DOM.create('div');
            content.className = 'cookie-modal-content';
            
            const closeBtn = DOM.create('button');
            closeBtn.className = 'cookie-modal-close';
            closeBtn.textContent = '×';
            DOM.setAttr(closeBtn, 'aria-label', 'Fechar');
            closeBtn.addEventListener('click', () => this.closePreferences());
            
            const h3 = DOM.create('h3');
            h3.textContent = 'Preferências de Cookies';
            
            const pref1 = this.createPreferenceItem(
                'Cookies Essenciais',
                'Cookies necessários para o funcionamento do site. Não podem ser desativados.',
                true,
                true
            );
            
            const pref2 = this.createPreferenceItem(
                'Cookies de Preferência',
                'Guardam as suas preferências como tema escuro/claro.',
                current.preferences || false,
                false
            );
            
            const pref3 = this.createPreferenceItem(
                'Cookies Analíticos',
                'Permitem analisar o uso do site de forma anónima.',
                current.analytics || false,
                false
            );
            
            const btnDiv = DOM.create('div');
            btnDiv.className = 'cookie-modal-buttons';
            
            const saveBtn = DOM.create('button');
            saveBtn.textContent = 'Guardar Preferências';
            saveBtn.addEventListener('click', () => this.savePreferences());
            
            btnDiv.appendChild(saveBtn);
            
            content.appendChild(closeBtn);
            content.appendChild(h3);
            content.appendChild(pref1);
            content.appendChild(pref2);
            content.appendChild(pref3);
            content.appendChild(btnDiv);
            modal.appendChild(content);
            
            return modal;
        },
        
        createPreferenceItem: function(title, desc, checked, disabled) {
            const item = DOM.create('div');
            item.className = 'cookie-preference-item';
            
            const label = DOM.create('label');
            
            const input = DOM.create('input');
            input.type = 'checkbox';
            input.checked = checked;
            input.disabled = disabled;
            
            const titleLower = title.toLowerCase().replace(/ /g, '-').replace('cookies-', '');
            input.id = 'pref-' + titleLower;
            
            const span = DOM.create('span');
            const strong = DOM.create('strong');
            strong.textContent = title;
            span.appendChild(strong);
            
            label.appendChild(input);
            label.appendChild(span);
            
            const p = DOM.create('p');
            p.textContent = desc;
            
            item.appendChild(label);
            item.appendChild(p);
            
            return item;
        },
        
        showPreferences: function() {
            const modal = this.createPreferencesModal();
            document.body.appendChild(modal);
            
            requestAnimationFrame(() => {
                DOM.addClass(modal, 'show');
            });
        },
        
        closePreferences: function() {
            const modal = DOM.el('#cookie-preferences-modal');
            if (modal) {
                DOM.removeClass(modal, 'show');
                setTimeout(() => modal.remove(), CONFIG.ANIMATION_DURATION);
            }
        },
        
        savePreferences: function() {
            const pref = DOM.el('#pref-preferncia');
            const ana = DOM.el('#pref-analticos');
            
            const preferences = {
                essential: true,
                preferences: pref ? pref.checked : false,
                analytics: ana ? ana.checked : false,
                timestamp: Date.now()
            };
            
            this.setStorage(preferences);
            this.closePreferences();
            this.hideBanner();
        }
    };
    
    const EasterEggs = {
        init: function() {
            this.initKonamiCode();
            this.initSecretCode();
            this.initPasswordChallenges();
            this.initEasterEggTriggers();
        },
        
        initKonamiCode: function() {
            let konamiCode = [];
            const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
            
            document.addEventListener('keydown', (e) => {
                konamiCode.push(e.code);
                konamiCode = konamiCode.slice(-10);
                
                if (konamiCode.join(',') === konamiSequence.join(',')) {
                    this.showMrRobotPanel();
                    konamiCode = [];
                }
            });
        },
        
        createModal: function(id, className) {
            const modal = DOM.create('div');
            modal.id = id;
            modal.className = className;
            return modal;
        },
        
        createCloseButton: function() {
            const btn = DOM.create('button');
            btn.className = 'close-easter';
            btn.textContent = '×';
            DOM.setAttr(btn, 'aria-label', 'Fechar');
            return btn;
        },
        
        showMrRobotPanel: function() {
            const panel = this.createModal('mr-robot-panel', 'mr-robot-panel');
            
            const content = DOM.create('div');
            content.className = 'mr-robot-content';
            
            const closeBtn = this.createCloseButton();
            closeBtn.addEventListener('click', () => panel.remove());
            
            const ascii = DOM.create('div');
            ascii.className = 'mr-robot-ascii';
            const pre = DOM.create('pre');
            pre.textContent = `    ╔══════════════════════════════════════╗
    ║    ██████╗ ██████╗ ███████╗ █████╗    ║
    ║   ██╔══██╗██╔══██╗██╔════╝██╔══██╗   ║
    ║   ██████╔╝██████╔╝█████╗  ███████║   ║
    ║   ██╔══██╗██╔══██╗██╔══╝  ██╔══██║   ║
    ║   ██║  ██║██████╔╝███████╗██║  ██║   ║
    ║   ╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝   ║
    ╚══════════════════════════════════════╝`;
            ascii.appendChild(pre);
            
            const h3 = DOM.create('h3');
            h3.style.cssText = 'color: #e00; text-shadow: 0 0 10px #f00;';
            h3.textContent = 'fsociety';
            
            const p1 = DOM.create('p');
            p1.style.cssText = 'color: #888; font-style: italic;';
            p1.textContent = '"Our democracy has been hacked."';
            
            const p2 = DOM.create('p');
            p2.style.cssText = 'color: #00ff00; margin-top: 1rem; font-size: 0.9rem;';
            p2.textContent = '"A bug is never just a bug. It\'s a symptom of a deeper flaw in the system."';
            
            const span = DOM.create('span');
            span.style.cssText = 'color: #666;';
            span.textContent = '— Elliot Alderson';
            p2.appendChild(DOM.create('br'));
            p2.appendChild(span);
            
            content.appendChild(closeBtn);
            content.appendChild(ascii);
            content.appendChild(h3);
            content.appendChild(p1);
            content.appendChild(p2);
            panel.appendChild(content);
            
            document.body.appendChild(panel);
        },
        
        initEasterEggTriggers: function() {
            const scoreEl = DOM.el('.score');
            if (scoreEl) {
                let clickCount = 0;
                let clickTimer = null;
                
                scoreEl.style.cursor = 'pointer';
                scoreEl.addEventListener('click', () => {
                    clickCount++;
                    if (clickTimer) clearTimeout(clickTimer);
                    if (clickCount >= 3) {
                        window.showEasterEgg && window.showEasterEgg();
                        clickCount = 0;
                    }
                    clickTimer = setTimeout(() => clickCount = 0, 1000);
                });
            }
            
            const easterHints = DOM.all('.easter-egg-hint');
            easterHints.forEach(hint => {
                hint.addEventListener('click', () => {
                    window.showEasterEgg && window.showEasterEgg();
                });
                hint.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        window.showEasterEgg && window.showEasterEgg();
                    }
                });
            });
        },
        
        initSecretCode: function() {
            const input = DOM.el('#secret-code-input');
            if (!input) return;
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    window.submitSecretCode && window.submitSecretCode();
                }
            });
        },
        
        initPasswordChallenges: function() {
            const passwordInputs = ['#password-input', '#rockyou-input'];
            passwordInputs.forEach(selector => {
                const input = DOM.el(selector);
                if (input) {
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            if (selector === '#password-input') {
                                window.submitPasswordChallenge && window.submitPasswordChallenge();
                            } else {
                                window.submitRockyouChallenge && window.submitRockyouChallenge();
                            }
                        }
                    });
                }
            });
        }
    };
    
    const Panels = {
        init: function() {
            window.showEasterEgg = function() {
                const panel = DOM.el('#easter-egg-panel');
                if (panel) DOM.addClass(panel, 'show');
            };
            
            window.closeEasterEgg = function() {
                const panel = DOM.el('#easter-egg-panel');
                if (panel) DOM.removeClass(panel, 'show');
            };
            
            window.openSecretInput = function() {
                const panel = DOM.el('#secret-code-panel');
                if (panel) {
                    DOM.addClass(panel, 'show');
                    const input = DOM.el('#secret-code-input');
                    if (input) input.focus();
                }
            };
            
            window.closeSecretInput = function() {
                const panel = DOM.el('#secret-code-panel');
                if (panel) {
                    DOM.removeClass(panel, 'show');
                    const input = DOM.el('#secret-code-input');
                    const error = DOM.el('#secret-error');
                    if (input) input.value = '';
                    if (error) error.textContent = '';
                }
            };
            
            window.submitSecretCode = function() {
                const input = DOM.el('#secret-code-input');
                const error = DOM.el('#secret-error');
                
                if (!input || !error) return;
                
                const sanitized = (input.value || '').replace(/[^0-9#]/g, '');
                
                if (sanitized === '27' || sanitized === '#27') {
                    window.closeSecretInput();
                    const room27 = DOM.el('#room27-panel');
                    if (room27) DOM.addClass(room27, 'show');
                } else {
                    error.textContent = 'ACESSO NEGADO - Código inválido';
                    input.value = '';
                }
            };
            
            window.closeRoom27 = function() {
                const panel = DOM.el('#room27-panel');
                if (panel) DOM.removeClass(panel, 'show');
            };
            
            window.openPasswordChallenge = function() {
                const panel = DOM.el('#password-challenge-panel');
                if (panel) {
                    DOM.addClass(panel, 'show');
                    const input = DOM.el('#password-input');
                    if (input) input.focus();
                }
            };
            
            window.closePasswordChallenge = function() {
                const panel = DOM.el('#password-challenge-panel');
                if (panel) {
                    DOM.removeClass(panel, 'show');
                    DOM.el('#password-input') && (DOM.el('#password-input').value = '');
                    DOM.el('#password-error') && (DOM.el('#password-error').textContent = '');
                    DOM.el('#password-success') && (DOM.el('#password-success').textContent = '');
                }
            };
            
            window.submitPasswordChallenge = async function() {
                const input = DOM.el('#password-input');
                const errorEl = DOM.el('#password-error');
                const successEl = DOM.el('#password-success');
                
                if (!input || !errorEl || !successEl) return;
                
                errorEl.textContent = '';
                successEl.textContent = '';
                
                const userPassword = input.value;
                if (!userPassword) {
                    errorEl.textContent = '⚠️ Introduza uma password para verificar!';
                    return;
                }
                
                try {
                    const encoder = new TextEncoder();
                    const data = encoder.encode(userPassword);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                    
                    const targetHash = '071542419dd270a3f5a674d10556b9bed28e6ec50e3d68df13c13b6b5ed26009';
                    
                    if (hashHex === targetHash) {
                        errorEl.textContent = '';
                        successEl.textContent = '🎉 PARABÉNS! 🎉 Descobriste o segredo!';
                        input.value = '';
                    } else {
                        errorEl.textContent = '❌ ACCESS DENIED - Password incorreta';
                        input.value = '';
                    }
                } catch (err) {
                    errorEl.textContent = '⚠️ Erro ao processar. Tente novamente.';
                }
            };
            
            window.openRockyouChallenge = function() {
                const panel = DOM.el('#rockyou-panel');
                if (panel) {
                    DOM.addClass(panel, 'show');
                    const input = DOM.el('#rockyou-input');
                    if (input) input.focus();
                }
            };
            
            window.closeRockyouChallenge = function() {
                const panel = DOM.el('#rockyou-panel');
                if (panel) {
                    DOM.removeClass(panel, 'show');
                    DOM.el('#rockyou-input') && (DOM.el('#rockyou-input').value = '');
                    DOM.el('#rockyou-error') && (DOM.el('#rockyou-error').textContent = '');
                    DOM.el('#rockyou-success') && (DOM.el('#rockyou-success').textContent = '');
                }
            };
            
            window.submitRockyouChallenge = async function() {
                const input = DOM.el('#rockyou-input');
                const errorEl = DOM.el('#rockyou-error');
                const successEl = DOM.el('#rockyou-success');
                
                if (!input || !errorEl || !successEl) return;
                
                errorEl.textContent = '';
                successEl.textContent = '';
                
                const userPassword = input.value;
                if (!userPassword) {
                    errorEl.textContent = '⚠️ Introduza uma password para verificar!';
                    return;
                }
                
                try {
                    const encoder = new TextEncoder();
                    const data = encoder.encode(userPassword);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                    
                    const targetHash = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f';
                    
                    if (hashHex === targetHash) {
                        errorEl.textContent = '';
                        successEl.textContent = '🔓 HASH CRACKED! Password: password123 - Lição: Nunca uses passwords comuns!';
                        input.value = '';
                    } else {
                        errorEl.textContent = '❌ WRONG HASH - Tenta novamente! Pensa como um utilizador preguiçoso...';
                    }
                } catch (err) {
                    errorEl.textContent = '⚠️ Erro ao processar. Tente novamente.';
                }
            };
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    ['easter-egg-panel', 'room27-panel', 'secret-code-panel', 'password-challenge-panel', 'rockyou-panel'].forEach(id => {
                        const panel = DOM.el('#' + id);
                        if (panel) DOM.removeClass(panel, 'show');
                    });
                }
            });
        }
    };
    
    const ActionHandlers = {
        init: function() {
            document.addEventListener('click', (e) => {
                const target = e.target.closest('[data-action]');
                if (!target) return;
                
                const action = target.getAttribute('data-action');
                
                switch(action) {
                    case 'show-easter':
                        window.showEasterEgg && window.showEasterEgg();
                        break;
                    case 'open-secret':
                        window.openSecretInput && window.openSecretInput();
                        break;
                    case 'open-rockyou':
                        window.openRockyouChallenge && window.openRockyouChallenge();
                        break;
                    case 'cookie-prefs':
                        window.CookieConsent && window.CookieConsent.showPreferences();
                        break;
                    case 'submit-password':
                        window.submitPasswordChallenge && window.submitPasswordChallenge();
                        break;
                    case 'submit-secret':
                        window.submitSecretCode && window.submitSecretCode();
                        break;
                    case 'submit-rockyou':
                        window.submitRockyouChallenge && window.submitRockyouChallenge();
                        break;
                    case 'close-room27':
                        window.closeRoom27 && window.closeRoom27();
                        break;
                    case 'close-easter':
                        window.closeEasterEgg && window.closeEasterEgg();
                        break;
                }
            });
            
            document.addEventListener('keydown', (e) => {
                const target = e.target.closest('[data-action]');
                if (!target) return;
                if (e.key !== 'Enter' && e.key !== ' ') return;
                
                const action = target.getAttribute('data-action');
                
                if (action === 'show-easter' || action === 'open-secret' || action === 'open-rockyou') {
                    e.preventDefault();
                    target.click();
                }
            });
        }
    };
    
    const ConsoleMessage = {
        init: function() {
            console.log('%c🔒 LayerZeppelin Security Portfolio', 'color: #00ff00; font-size: 20px; font-weight: bold;');
            console.log('%c⚡ Cybersecurity | Penetration Testing | Ethical Hacking', 'color: #00ff00; font-size: 12px;');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #333; font-size: 10px;');
            console.log('%c⚠️ Atenção: Toda a informação neste site é para fins educativos.', 'color: #ff5f56; font-size: 10px;');
        }
    };
    
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initApp);
        } else {
            initApp();
        }
    }
    
    function initApp() {
        MatrixBackground.init();
        Navigation.init();
        CookieConsent.init();
        EasterEggs.init();
        Panels.init();
        ActionHandlers.init();
        ConsoleMessage.init();
    }
    
    init();
    
    window.CookieConsent = CookieConsent;
    
})();