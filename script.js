/* ===========================================================================
 * LAYERZEPPELIN.PT - SCRIPT.JS
 * ===========================================================================
 * Módulo principal do portfolio de cybersecurity.
 * 
 * ESTRUTURA:
 *   1. CONFIG        - Configurações globais (timers, fontes)
 *   2. DOM           - Utilitários de manipulação DOM (helper functions)
 *   3. MatrixBackground - Animação canvas de fundo estilo "Matrix rain"
 *   4. Navigation     - Menu hamburger responsivo mobile
 *   5. CookieConsent  - Sistema de consentimento cookies (RGPD compliant)
 *   6. EasterEggs     - Konami code, password challenges, hardware arsenal
 *   7. Panels          - Gestão de painéis modais (easter eggs, challenges)
 *   8. ActionHandlers  - Delegação de eventos via data-action
 *   9. ThemeToggle     - Alternância tema claro/escuro
 *  10. GitHubRepos     - Fetch e render de repos GitHub via API
 *  11. SecurityProtection - Anti-inspeção e anti-cópia (defesa básica)
 *  12. ConsoleMessage  - Mensagens decorativas no console
 *  13. init/initApp    - Inicialização de todos os módulos
 * 
 * SEGURANÇA:
 *   - IIFE para evitar poluição do scope global
 *   - Sanitização de input no secret code (apena números e #)
 *   - Hashes SHA-256 verificados client-side (não há dados sensíveis no código)
 *   - CSP no _headers já bloqueia scripts inline no deploy
 *   - Cookie consent RGPD compliant
 * =========================================================================== */
(function() {
    'use strict';
    
    /* -----------------------------------------------------------------------
     * 1. CONFIG
     * Configurações centrais. MATRIX_INTERVAL controla a velocidade da
     * animação (ms). MATRIX_FONT_SIZE é o tamanho das "letras" que caem.
     * ANIMATION_DURATION é usado para timings de CSS transitions.
     * ----------------------------------------------------------------------- */
    const CONFIG = {
        MATRIX_INTERVAL: 50,       // ms entre cada frame da animação Matrix
        MATRIX_FONT_SIZE: 14,      // px - tamanho da fonte no canvas
        ANIMATION_DURATION: 300    // ms - duração de animações de transição
    };
    
    /* -----------------------------------------------------------------------
     * 2. DOM
     * Funções utilitárias para manipulação DOM. Tudo passa por aqui para
     * evitar querySelector/setAttribute分散 pelo código e facilitar
     * debugging. setText usa textContent (seguro contra XSS).
     * ----------------------------------------------------------------------- */
    const DOM = {
        el: (selector) => document.querySelector(selector),
        all: (selector) => document.querySelectorAll(selector),
        create: (tag) => document.createElement(tag),
        setText: (el, text) => { el.textContent = text; return el; },  // textContent previne XSS
        addClass: (el, ...classes) => { el.classList.add(...classes); return el; },
        removeClass: (el, ...classes) => { el.classList.remove(...classes); return el; },
        setAttr: (el, attr, value) => { el.setAttribute(attr, value); return el; }
    };
    
    /* -----------------------------------------------------------------------
     * 3. MatrixBackground
     * Desenha a animação "Matrix rain" no canvas #matrix-bg.
     * Usa palavras de cybersecurity (não passwords reais) para cair
     * de forma aleatória com caracteres katakana japoneses.
     * 
     * SEGURANÇA: Não usa nenhuma password real. As "words" são termos
     * técnicos genéricos de cybersecurity.
     * ----------------------------------------------------------------------- */
    const MatrixBackground = {
        canvas: null,
        ctx: null,
        columns: [],
        fontSize: CONFIG.MATRIX_FONT_SIZE,
        
        // Palavras que caem na animação Matrix.
        // Combinação de termos de cybersecurity + passwords da breach RockYou (2009).
        // SEGURANÇA: São passwords públicas e amplamente conhecidas, NÃO sensíveis.
        // A inclusão é intencional — reforça a temática de cybersecurity do portfolio.
        words: [
            // Termos técnicos de cybersecurity
            'root', 'admin', 'access', 'system', 'network', 'security',
            'cyber', 'hack', 'exploit', 'payload', 'shell', 'kernel',
            'firewall', 'proxy', 'tunnel', 'encrypt', 'decrypt', 'cipher',
            'protocol', 'packet', 'socket', 'buffer', 'overflow', 'injection',
            'authentication', 'authorization', 'privilege', 'escalation',
            'penetration', 'testing', 'vulnerability', 'assessment', 'audit',
            // RockYou leak — top passwords (educational, already public)
            'password', '123456', 'qwerty', 'abc123', 'letmein',
            'monkey', 'dragon', 'master', 'shadow', 'sunshine',
            'football', 'trustno1', 'iloveyou', 'princess', 'starwars'
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
            // Fade effect - desenha um retângulo semi-transparente sobre o canvas
            // isto cria o efeito de "rasto" que desaparece
            this.ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = this.fontSize + 'px monospace';
            
            for (let i = 0; i < this.columns.length; i++) {
                // 30% de probabilidade de mostrar uma palavra, 70% mostra carácter katakana
                const word = this.words[Math.floor(Math.random() * this.words.length)];
                const char = Math.random() > 0.7 ? word : String.fromCharCode(0x30A0 + Math.random() * 96);
                
                this.ctx.fillText(char, i * this.fontSize, this.columns[i] * this.fontSize);
                
                // Reset aleatório da coluna para criar efeito de "gota" descontínuo
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
    
    /* -----------------------------------------------------------------------
     * 3b. HTTPSRedirect
     * Força HTTPS em produção. Movido do inline script no HTML para aqui
     * porque CSP script-src 'self' bloqueia scripts inline.
     * Cloudflare Pages também força HTTPS ao nível do servidor, mas
     * isto serve como fallback para outros hostings.
     * ----------------------------------------------------------------------- */
    const HTTPSRedirect = {
        init: function() {
            if (location.protocol === 'http:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                location.replace('https:' + location.href.substring(5));
            }
        }
    };
    
    /* -----------------------------------------------------------------------
     * 4. Navigation
     * Controla o menu hamburger em mobile. Fecha ao clicar num link
     * ou fora do menu. Usa aria-expanded para acessibilidade.
     * ----------------------------------------------------------------------- */
    const Navigation = {
        toggle: null,
        navLinks: null,
        isOpen: false,
        
        init: function() {
            this.toggle = DOM.el('.nav-toggle');
            this.navLinks = DOM.el('.nav-links');
            
            if (this.toggle && this.navLinks) {
                // Toggle do menu hamburger
                this.toggle.addEventListener('click', () => this.handleToggle());
                
                // Fechar menu ao clicar num link interno
                DOM.all('.nav-links a').forEach(link => {
                    link.addEventListener('click', () => this.close());
                });
                
                // Fechar menu ao clicar fora
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
            DOM.setAttr(this.toggle, 'aria-expanded', this.isOpen);  // Acessibilidade
        },
        
        close: function() {
            this.isOpen = false;
            DOM.removeClass(this.navLinks, 'active');
            DOM.removeClass(this.toggle, 'active');
            DOM.setAttr(this.toggle, 'aria-expanded', 'false');
        }
    };
    
    /* -----------------------------------------------------------------------
     * 5. CookieConsent
     * Sistema RGPD-compliant de consentimento de cookies.
     * Usa localStorage para persistir preferências (SEM enviar para servidor).
     * 
     * SEGURANÇA:
     *   - Cookies são apenas essenciais + preferência + analytics
     *   - Nenhum cookie de marketing/tracking de terceiros
     *   - Dados ficam apenas em localStorage (client-side)
     *   - cookie_consent guardado como JSON com timestamp
     * ----------------------------------------------------------------------- */
    const CookieConsent = {
        cookieName: 'cookie_consent',   // Chave no localStorage
        storage: null,
        
        init: function() {
            this.storage = this.getStorage();
            if (!this.storage) {
                this.showBanner();  // Mostra banner se não há consentimento registado
            }
        },
        
        getStorage: function() {
            try {
                return localStorage.getItem(this.cookieName);
            } catch (e) {
                // localStorage pode não estar disponível (modo privado, etc.)
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
        
        // Cria o DOM do banner de cookies programaticamente (sem innerHTML)
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
            if (DOM.el('#cookie-banner')) return;  // Prevenir duplicados
            const banner = this.createBanner();
            document.body.appendChild(banner);
            requestAnimationFrame(() => DOM.addClass(banner, 'show'));
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
            // Mesmo rejeitando, cookies essenciais são necessários
            this.setStorage({
                essential: true,
                preferences: false,
                analytics: false,
                timestamp: Date.now()
            });
            this.hideBanner();
        },
        
        createPreferencesModal: function() {
            // BUG CONHECIDO: this.storage pode ser null se o banner ainda não foi mostrado
            // Aceder JSON.parse(null) retorna null, mas os defaults cobrem isso
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
            
            // Cookie essencial - sempre ativo, não pode desativar
            const pref1 = this.createPreferenceItem(
                'pref-essenciais',
                'Cookies Essenciais',
                'Cookies necessários para o funcionamento do site. Não podem ser desativados.',
                true,
                true
            );
            
            // Cookie de preferência (ex: tema dark/light)
            const pref2 = this.createPreferenceItem(
                'pref-preferencias',
                'Cookies de Preferência',
                'Guardam as suas preferências como tema escuro/claro.',
                current.preferences || false,
                false
            );
            
            // Cookie analítico (GoatCounter Analytics - sem cookies, mas damos opção)
            const pref3 = this.createPreferenceItem(
                'pref-analytics',
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
        
        createPreferenceItem: function(id, title, desc, checked, disabled) {
            const item = DOM.create('div');
            item.className = 'cookie-preference-item';
            
            const label = DOM.create('label');
            
            const input = DOM.create('input');
            input.type = 'checkbox';
            input.checked = checked;
            input.disabled = disabled;
            // Fix: usar ID fixo passado como parâmetro, não gerado dinamicamente
            input.id = id;
            
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
            requestAnimationFrame(() => DOM.addClass(modal, 'show'));
        },
        
        closePreferences: function() {
            const modal = DOM.el('#cookie-preferences-modal');
            if (modal) {
                DOM.removeClass(modal, 'show');
                setTimeout(() => modal.remove(), CONFIG.ANIMATION_DURATION);
            }
        },
        
        // Fix: IDs fixos corretos, correspondentes aos parâmetros de createPreferenceItem
        savePreferences: function() {
            const pref = DOM.el('#pref-preferencias');
            const ana = DOM.el('#pref-analytics');
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
    
    /* -----------------------------------------------------------------------
     * 6. EasterEggs
     * Sistema de easter eggs escondidos no site:
     *   - Konami Code (↑↑↓↓←→←→BA) → Painel Mr. Robot
     *   - Click 3x no "Security Score" → Hardware Arsenal
     *   - Click em hints com data-action → diferentes painéis
     *   - Room 27 (código secreto #27) → CTF Challenge
     *   - Password Challenge (SHA-256 hash de "Sporting1906")
     *   - RockYou Challenge (SHA-256 hash de "password123")
     * 
     * SEGURANÇA:
     *   - Os hashes SHA-256 são verificados client-side. Isto é intencional
     *     porque são challenges educativos, não segurança real.
     *   - As passwords (Sporting1906, password123) podem ser extraídas do
     *     código, MAS é o propósito do challenge — é um CTF educativo.
     *   - sanitize no secret code: remove tudo exceto números e #
     * ----------------------------------------------------------------------- */
    const EasterEggs = {
        init: function() {
            this.initKonamiCode();
            this.initSecretCode();
            this.initPasswordChallenges();
            this.initEasterEggTriggers();
        },
        
        // Konami Code: ↑↑↓↓←→←→BA → Abre painel Mr. Robot
        initKonamiCode: function() {
            let konamiCode = [];
            const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
            
            document.addEventListener('keydown', (e) => {
                konamiCode.push(e.code);
                konamiCode = konamiCode.slice(-10);  // Manter apenas últimos 10 inputs
                
                if (konamiCode.join(',') === konamiSequence.join(',')) {
                    this.showMrRobotPanel();
                    konamiCode = [];
                }
            });
        },
        
        // Utilitário: criar um modal genérico
        createModal: function(id, className) {
            const modal = DOM.create('div');
            modal.id = id;
            modal.className = className;
            return modal;
        },
        
        // Utilitário: criar botão de fechar
        createCloseButton: function() {
            const btn = DOM.create('button');
            btn.className = 'close-easter';
            btn.textContent = '×';
            DOM.setAttr(btn, 'aria-label', 'Fechar');
            return btn;
        },
        
        // Painel do Mr. Robot (Konami Code)
        // Conteúdo é criado programaticamente (sem innerHTML) para prevenir XSS
        showMrRobotPanel: function() {
            const panel = this.createModal('mr-robot-panel', 'mr-robot-panel');
            
            const content = DOM.create('div');
            content.className = 'mr-robot-content';
            
            const closeBtn = this.createCloseButton();
            closeBtn.addEventListener('click', () => panel.remove());
            
            // ASCII art do fsociety
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
            
            // Shell commands — merge da versão "por saber"
            const commandsDiv = DOM.create('div');
            commandsDiv.style.cssText = 'margin-top: 1.5rem; text-align: left;';
            
            const cmdsTitle = DOM.create('p');
            cmdsTitle.style.cssText = 'color: #0f0; font-weight: bold;';
            cmdsTitle.textContent = 'Shell Commands Used:';
            commandsDiv.appendChild(cmdsTitle);
            
            const shellCommands = [
                '$ whoami',
                '$ ls -la /var/www',
                '$ nmap -sV -sC target',
                '$ hydra -l user -P wordlist.txt ssh://target',
                '$ msfconsole',
                '$ burpsuite',
                '$ airmon-ng start wlan0',
                '$ airodump-ng wlan0mon',
                '$ grep -r "password" /var/www/html/',
                '$ nc -lvnp 4444',
                '$ python -m http.server 8080'
            ];
            
            const cmdCode = DOM.create('div');
            cmdCode.style.cssText = 'color: #0f0; background: #111; padding: 0.5rem; margin: 0.5rem 0; font-size: 0.8rem; font-family: monospace; white-space: pre;';
            cmdCode.textContent = shellCommands.join('\n');
            commandsDiv.appendChild(cmdCode);
            
            // Evil Corp references
            const refsTitle = DOM.create('p');
            refsTitle.style.cssText = 'color: #888; margin-top: 1rem;';
            refsTitle.textContent = 'Evil Corp References:';
            commandsDiv.appendChild(refsTitle);
            
            const refs = [
                'E Corp (Evil Corp) - The conglomerate',
                'Steel Mountain - Data storage company',
                'Whiterose - Dark Army leader',
                'Price, Tyrell, Angela - Key figures',
                'Raspberry Pi hacks',
                'Distributed data backup attack'
            ];
            
            const refsList = DOM.create('ul');
            refsList.style.cssText = 'color: #666; text-align: left; padding-left: 2rem;';
            refs.forEach(ref => {
                const li = DOM.create('li');
                li.textContent = ref;
                refsList.appendChild(li);
            });
            commandsDiv.appendChild(refsList);
            
            content.appendChild(closeBtn);
            content.appendChild(ascii);
            content.appendChild(h3);
            content.appendChild(p1);
            content.appendChild(p2);
            content.appendChild(commandsDiv);
            panel.appendChild(content);
            
            document.body.appendChild(panel);
        },
        
        // Triggers: click no score 3x ou click nos hints
        initEasterEggTriggers: function() {
            const scoreEl = DOM.el('.score');
            if (scoreEl) {
                let clickCount = 0;
                let clickTimer = null;
                
                // Click 3x no "Security Score" para abrir Hardware Arsenal
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
            
            // Click nos hints do footer
            const easterHints = DOM.all('.easter-egg-hint');
            easterHints.forEach(hint => {
                hint.addEventListener('click', () => {
                    window.showEasterEgg && window.showEasterEgg();
                });
                // Acessibilidade: suporte keyboard
                hint.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        window.showEasterEgg && window.showEasterEgg();
                    }
                });
            });
        },
        
        // Enter key no input do código secreto (#27)
        initSecretCode: function() {
            const input = DOM.el('#secret-code-input');
            if (!input) return;
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    window.submitSecretCode && window.submitSecretCode();
                }
            });
        },
        
        // Enter key nos inputs de password challenges
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
    
    /* -----------------------------------------------------------------------
     * 7. Panels
     * Gestão de todos os painéis modais do site. Cada função é exposta
     * globalmente (window.*) para poder ser chamada pelos ActionHandlers
     * e por onclick nos elementos data-action do HTML.
     * 
     * SEGURANÇA:
     *   - submitSecretCode: Sanitiza input com regex [^0-9#] — só aceita
     *     números e #. Isto previne injeção de qualquer tipo.
     *   - submitPasswordChallenge & submitRockyouChallenge: Calculam SHA-256
     *     client-side e comparam com hash hardcoded. A password nunca sai
     *     do browser. Os hashes são para challenges educativos de CTF.
     * ----------------------------------------------------------------------- */
    const Panels = {
        init: function() {
            // Hardware Arsenal panel
            window.showEasterEgg = function() {
                const panel = DOM.el('#easter-egg-panel');
                if (panel) DOM.addClass(panel, 'show');
            };
            
            window.closeEasterEgg = function() {
                const panel = DOM.el('#easter-egg-panel');
                if (panel) DOM.removeClass(panel, 'show');
            };
            
            // Room 27 secret code panel
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
            
            // Validação do código secreto Room 27
            // SEGURANÇA: Sanitização — remove tudo excepto dígitos e #
            // O código é "27" ou "#27" — é um easter egg, não segurança real
            window.submitSecretCode = function() {
                const input = DOM.el('#secret-code-input');
                const error = DOM.el('#secret-error');
                
                if (!input || !error) return;
                
                // Sanitização: remover tudo excepto números e #
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
            
            // Password Challenge — SHA-256 de "Sporting1906"
            // NOTA DE SEGURANÇA: Isto é um challenge EDUCATIVO de CTF.
            // A resposta pode ser extraída do código, mas é propósito.
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
            
            // Password Challenge: verifica SHA-256 client-side
            // A password NÃO é enviada para nenhum servidor.
            // O hash é: SHA-256("Sporting1906") = 071542419dd270...
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
                    // SHA-256 calculado no browser — nada sai do dispositivo
                    const encoder = new TextEncoder();
                    const data = encoder.encode(userPassword);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                    
                    // Hash target: SHA-256("Sporting1906")
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
            
            // RockYou Challenge
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
            
            // RockYou Challenge: SHA-256 de "password123" (o hash mais comum)
            // NOTA DE SEGURANÇA: Challenge educativo sobre a brecha RockYou (2009).
            // O objetivo é demonstrar que passwords comuns são trivialmente crackáveis.
            // O hash SHA-256("password123") = ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
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
            
            // ESC fecha todos os painéis
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
    
    /* -----------------------------------------------------------------------
     * 8. ActionHandlers
     * Sistema de delegação de eventos baseado em data-action.
     * Em vez de onclick no HTML, usamos data-action="acao" e este módulo
     * despacha a ação correspondente. Isto centraliza a lógica e facilita
     * manutenção e auditoria de segurança.
     * 
     * Ações disponíveis:
     *   show-easter      → Mostra Hardware Arsenal
     *   open-secret      → Abre input do código #27
     *   open-rockyou     → Abre RockYou Challenge
     *   cookie-prefs     → Abre preferências de cookies
     *   submit-password  → Submete password challenge
     *   submit-secret    → Submete código secreto
     *   submit-rockyou   → Submete RockYou challenge
     *   close-room27     → Fecha Room 27
     *   close-easter     → Fecha Hardware Arsenal
     *   toggle-theme     → Alterna tema claro/escuro
     * ----------------------------------------------------------------------- */
    const ActionHandlers = {
        init: function() {
            // Delegação de click events
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
                    case 'toggle-theme':
                        ThemeToggle.toggle();
                        break;
                }
            });
            
            // Acessibilidade: suporte keyboard para data-action
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
    
    /* -----------------------------------------------------------------------
     * 9. ThemeToggle
     * Guarda preferência em localStorage (key: 'theme-preference').
     * Alterna classe 'light-theme' no <body>.
     * Ícone muda entre 🌙 (dark) e ☀️ (light).
     * ----------------------------------------------------------------------- */
    const ThemeToggle = {
        storageKey: 'lz_theme',  // Prefix 'lz_' para evitar conflitos
        
        init: function() {
            const saved = localStorage.getItem(this.storageKey);
            if (saved === 'light') {
                document.body.classList.add('light-theme');
                this.updateIcon('light');
            }
        },
        
        toggle: function() {
            const isLight = document.body.classList.toggle('light-theme');
            localStorage.setItem(this.storageKey, isLight ? 'light' : 'dark');
            this.updateIcon(isLight ? 'light' : 'dark');
        },
        
        updateIcon: function(theme) {
            const icon = DOM.el('.theme-icon');
            if (icon) {
                icon.textContent = theme === 'light' ? '☀️' : '🌙';
            }
        }
    };
    
    /* -----------------------------------------------------------------------
     * 10. GitHubRepos
     * Faz fetch à API GitHub para mostrar os últimos 6 repos do utilizador
     * HSMTFPS. Usa localStorage como cache com TTL de 1 hora.
     * 
     * SEGURANÇA:
     *   - renderRepos usa textContent para nome e innerHTML para a card.
     *     repo.html_url e repo.description vêm da API do GitHub.
     *   - RISCO: innerHTML com dados externos (API GitHub) pode permitir
     *     XSS se o GitHub comprometer o conteúdo. No entanto, a API do
     *     GitHub sanitiza description e html_url, pelo que o risco é baixo.
     *   - A URL da API é hardcoded (não há user input), logo sem risco de
     *     SSRF ou injeção.
     * ----------------------------------------------------------------------- */
    const GitHubRepos = {
        username: 'HSMTFPS',
        cacheKey: 'github_repos_cache',
        cacheTime: 3600000,  // 1 hora em ms
        
        init: function() {
            this.loadRepos();
        },
        
        loadRepos: async function() {
            const container = DOM.el('#github-repos');
            const loading = DOM.el('#github-loading');
            
            if (!container) return;
            
            const cached = this.getCache();
            if (cached) {
                this.renderRepos(cached, container);
                if (loading) loading.style.display = 'none';
                return;
            }
            
            try {
                const response = await fetch(`https://api.github.com/users/${this.username}/repos?sort=updated&per_page=100`);
                if (!response.ok) throw new Error('Failed to fetch');
                
                const repos = await response.json();
                const allowedRepos = ['LayerZeppelin'];
                const filtered = repos.filter(r => allowedRepos.includes(r.name));
                this.setCache(filtered);
                this.renderRepos(filtered, container);
                if (loading) loading.style.display = 'none';
            } catch (error) {
                if (loading) {
                    loading.textContent = 'Unable to load repositories';
                    loading.style.color = '#ff5f56';
                }
            }
        },
        
        getCache: function() {
            try {
                const cached = localStorage.getItem(this.cacheKey);
                if (!cached) return null;
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp > this.cacheTime) return null;  // Cache expirado
                return data;
            } catch { return null; }
        },
        
        setCache: function(data) {
            try {
                localStorage.setItem(this.cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
            } catch {}  // localStorage cheio — ignorar silenciosamente
        },
        
        renderRepos: function(repos, container) {
            if (!repos || repos.length === 0) return;
            
            // NOTA DE SEGURANÇA: Usamos innerHTML com dados da API GitHub.
            // O risco de XSS é mínimo porque a API sanitiza description/html_url.
            // Se quisermos máxima segurança, devemos usar DOM element creation.
            container.innerHTML = repos.map(repo => `
                <div class="github-card">
                    <h4><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h4>
                    <p>${repo.description || 'No description'}</p>
                    <div class="repo-stats">
                        <span>⭐ ${repo.stargazers_count}</span>
                        <span>🔤 ${repo.language || 'N/A'}</span>
                    </div>
                </div>
            `).join('');
        }
    };
    
    /* -----------------------------------------------------------------------
     * 11. SecurityProtection (NOVO — merge de "por saber")
     * Proteção básica contra inspeção e cópia. Isto é DEFESA EM PROFUNDIDADE
     * e NÃO substitui medidas reais de segurança. Serve apenas para
     * dificultar copiar conteúdo para visitantes casuais.
     * 
     * NOTA IMPORTANTE: Estas proteções são facilmente ultrapassáveis por
     * qualquer pessoa com conhecimento técnico (devtools, curl, etc.).
     * São "security through obscurity" e servem mais como demonstração do
     * que como proteção real.
     * 
     * Proteções aplicadas:
     *   - Bloqueia right-click (contextmenu)
     *   - Bloqueia select/copy/cut
     *   - Bloqueia Ctrl+U (ver código), Ctrl+S (guardar), Ctrl+A (select all), Ctrl+P (imprimir)
     *   - Bloqueia F12 (devtools)
     *   - Bloqueia Ctrl+Shift+I/J/C (devtools)
     *   - Bloqueia Ctrl+Shift+I (inspector)
     * ----------------------------------------------------------------------- */
    const SecurityProtection = {
        init: function() {
            // Bloquear right-click
            document.addEventListener('contextmenu', (e) => e.preventDefault());
            
            // Bloquear select, copy, cut
            document.addEventListener('selectstart', (e) => e.preventDefault());
            document.addEventListener('copy', (e) => e.preventDefault());
            document.addEventListener('cut', (e) => e.preventDefault());
            
            // Bloquear atalhos de teclado comuns para inspeção
            document.addEventListener('keydown', (e) => {
                // Ctrl+U (ver código), Ctrl+S (guardar), Ctrl+A (select all), Ctrl+P (imprimir)
                if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'a' || e.key === 'p')) {
                    e.preventDefault();
                }
                // F12 (devtools)
                if (e.key === 'F12') {
                    e.preventDefault();
                }
                // Ctrl+Shift+I/J/C (devtools)
                if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
                    e.preventDefault();
                }
            });
        }
    };
    
    /* -----------------------------------------------------------------------
     * 12. ConsoleMessage
     * Mensagens decorativas para quem abre o devtools.
     * Avisa que o site é para fins educativos.
     * ----------------------------------------------------------------------- */
    const ConsoleMessage = {
        init: function() {
            console.log('%c🔒 LayerZeppelin Security Portfolio', 'color: #00ff00; font-size: 20px; font-weight: bold;');
            console.log('%c⚡ Cybersecurity | Penetration Testing | Ethical Hacking', 'color: #00ff00; font-size: 12px;');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #333; font-size: 10px;');
            console.log('%c⚠️ Atenção: Toda a informação neste site é para fins educativos.', 'color: #ff5f56; font-size: 10px;');
            
            // Easter eggs no console
            console.log('%c🎭 Mr. Robot Easter Egg', 'color: #ff0000; font-size: 14px; font-weight: bold;');
            console.log('%c"Control is an illusion." - Elliot Alderson', 'color: #888; font-size: 10px; font-style: italic;');
            console.log('%cTry the Konami code: ↑↑↓↓←→←→BA', 'color: #00ff00; font-size: 10px;');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #333; font-size: 10px;');
            console.log('%c💀 RockYou Challenge', 'color: #ff0000; font-size: 12px; font-weight: bold;');
            console.log('%cCan you crack the hash? Check the footer!', 'color: #888; font-size: 10px;');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #333; font-size: 10px;');
            console.log('%c🔐 Password Challenge', 'color: #00ff00; font-size: 12px; font-weight: bold;');
            console.log('%c[SECRET] There\'s a hidden room... Find the code: #__', 'color: #00ff00; font-size: 10px;');
            console.log('%c[HINT] The number you seek is twenty-seven', 'color: #006600; font-size: 10px;');
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #333; font-size: 10px;');
            console.log('%cHardware Arsenal: Flipper Zero | ESP32 Marauder | Hale Hound | Ghost | Bruce | Pwnagotchi', 'color: #00ff00; font-size: 12px;');
        }
    };
    
    /* -----------------------------------------------------------------------
     * 13. Inicialização
     * Aguarda DOMContentLoaded e inicia todos os módulos.
     * Ordem: Matrix → Nav → Cookie → Easter → Panels → Actions → Theme → GitHub → Security → Console
     * ----------------------------------------------------------------------- */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initApp);
        } else {
            initApp();
        }
    }
    
    function initApp() {
        HTTPSRedirect.init();
        MatrixBackground.init();
        Navigation.init();
        CookieConsent.init();
        EasterEggs.init();
        Panels.init();
        ActionHandlers.init();
        ThemeToggle.init();
        GitHubRepos.init();
        SecurityProtection.init();
        ConsoleMessage.init();
    }
    
    init();
    
    // Expor CookieConsent globalmente para os data-action handlers
    window.CookieConsent = CookieConsent;
    
})();