/**
 * UI Controller
 */
class UIController {
    constructor() {
        this.currentGuild = null;
        this.currentChannel = null;
        this.guilds = new Map();
        this.channels = new Map();
        this.messages = new Map();
        this.user = null;
        
        this.initElements();
        this.attachEventListeners();
    }

    /**
     * Initialize DOM elements
     */
    initElements() {
        // Screens
        this.loginScreen = document.getElementById('login-screen');
        this.appScreen = document.getElementById('app-screen');
        
        // Login
        this.loginForm = document.getElementById('login-form');
        this.tokenInput = document.getElementById('token-input');
        this.showTokenCheckbox = document.getElementById('show-token');
        this.loginError = document.getElementById('login-error');
        
        // Main UI
        this.guildsList = document.getElementById('guilds-list');
        this.channelsList = document.getElementById('channels-list');
        this.messagesContainer = document.getElementById('messages-container');
        this.messageForm = document.getElementById('message-form');
        this.messageInput = document.getElementById('message-input');
        this.messageInputContainer = document.getElementById('message-input-container');
        
        // Headers
        this.guildName = document.getElementById('guild-name');
        this.currentChannelName = document.getElementById('current-channel-name');
        this.statusIndicator = document.getElementById('connection-status');
        this.statusText = document.getElementById('status-text');
        
        // User panel
        this.userAvatar = document.getElementById('user-avatar');
        this.username = document.getElementById('username');
        this.userTag = document.getElementById('user-tag');
        
        // Buttons
        this.homeButton = document.getElementById('home-button');
        this.logoutButton = document.getElementById('logout-button');
        this.settingsButton = document.getElementById('settings-button');
        
        // Settings modal
        this.settingsModal = document.getElementById('settings-modal');
        this.closeSettings = document.getElementById('close-settings');
        this.botId = document.getElementById('bot-id');
        this.guildCount = document.getElementById('guild-count');
        this.compactModeCheckbox = document.getElementById('compact-mode');
        this.darkModeCheckbox = document.getElementById('dark-mode');
        this.messageLimitSelect = document.getElementById('message-limit');
        
        // Loading
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.loadingText = document.getElementById('loading-text');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Show/hide token
        this.showTokenCheckbox.addEventListener('change', () => {
            this.tokenInput.type = this.showTokenCheckbox.checked ? 'text' : 'password';
        });
        
        // Logout
        this.logoutButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                this.logout();
            }
        });
        
        // Settings
        this.settingsButton.addEventListener('click', () => {
            this.openSettings();
        });
        
        this.closeSettings.addEventListener('click', () => {
            this.closeSettingsModal();
        });
        
        // Settings changes
        this.compactModeCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('compact-mode', this.compactModeCheckbox.checked);
            this.saveSettings();
        });
        
        this.darkModeCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('light-mode', !this.darkModeCheckbox.checked);
            this.saveSettings();
        });
        
        this.messageLimitSelect.addEventListener('change', () => {
            this.saveSettings();
        });
        
        // Modal click outside
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettingsModal();
            }
        });
        
        // Load saved settings
        this.loadSettings();
    }

    /**
     * Show login screen
     */
    showLogin() {
        this.loginScreen.classList.add('active');
        this.appScreen.classList.remove('active');
    }

    /**
     * Show app screen
     */
    showApp() {
        this.loginScreen.classList.remove('active');
        this.appScreen.classList.add('active');
    }

    /**
     * Show login error
     */
    showLoginError(message) {
        this.loginError.textContent = message;
        this.loginError.style.display = 'block';
    }

    /**
     * Hide login error
     */
    hideLoginError() {
        this.loginError.style.display = 'none';
    }

    /**
     * Show loading
     */
    showLoading(text = 'Loading...') {
        this.loadingText.textContent = text;
        this.loadingOverlay.style.display = 'flex';
    }

    /**
     * Hide loading
     */
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    /**
     * Update connection status
     */
    updateConnectionStatus(status) {
        this.statusIndicator.className = 'status-indicator ' + status;
        
        const statusTexts = {
            'connected': 'Connected',
            'connecting': 'Connecting...',
            'disconnected': 'Disconnected'
        };
        
        this.statusText.textContent = statusTexts[status] || status;
    }

    /**
     * Set user info
     */
    setUserInfo(user) {
        this.user = user;
        this.username.textContent = user.username;
        // Discord's new username system: discriminator is '0' for new accounts
        if (user.discriminator && user.discriminator !== '0') {
            this.userTag.textContent = `#${user.discriminator}`;
        } else {
            this.userTag.textContent = '@' + user.username;
        }
        
        // Set avatar
        const avatarUrl = app.api.getUserAvatarURL(user, 32);
        if (user.avatar) {
            const img = document.createElement('img');
            img.src = avatarUrl;
            img.alt = user.username;
            this.userAvatar.innerHTML = '';
            this.userAvatar.appendChild(img);
        } else {
            this.userAvatar.textContent = user.username.charAt(0).toUpperCase();
        }
        
        // Update settings
        this.botId.textContent = user.id;
    }

    /**
     * Render guilds
     */
    renderGuilds(guilds) {
        this.guildsList.innerHTML = '';
        this.guilds.clear();
        
        guilds.forEach(guild => {
            this.guilds.set(guild.id, guild);
            const guildElement = this.createGuildElement(guild);
            this.guildsList.appendChild(guildElement);
        });
        
        this.guildCount.textContent = guilds.length;
    }

    /**
     * Create guild element
     */
    createGuildElement(guild) {
        const div = document.createElement('div');
        div.className = 'guild-item';
        div.dataset.guildId = guild.id;
        div.title = guild.name;
        
        const iconUrl = app.api.getGuildIconURL(guild, 48);
        if (iconUrl) {
            const img = document.createElement('img');
            img.src = iconUrl;
            img.alt = guild.name;
            div.appendChild(img);
        } else {
            // Create acronym from guild name
            const acronym = guild.name
                .split(' ')
                .map(word => word.charAt(0))
                .join('')
                .toUpperCase()
                .slice(0, 4);
            
            const span = document.createElement('span');
            span.className = 'guild-acronym';
            span.textContent = acronym;
            div.appendChild(span);
        }
        
        div.addEventListener('click', () => {
            this.selectGuild(guild.id);
        });
        
        return div;
    }

    /**
     * Select guild
     */
    async selectGuild(guildId) {
        const guild = this.guilds.get(guildId);
        if (!guild) return;
        
        this.currentGuild = guild;
        this.currentChannel = null;
        
        // Update UI
        document.querySelectorAll('.guild-item').forEach(el => {
            el.classList.toggle('active', el.dataset.guildId === guildId);
        });
        
        this.guildName.textContent = guild.name;
        this.messagesContainer.innerHTML = '<div class="no-messages">Select a channel to view messages</div>';
        this.messageInputContainer.style.display = 'none';
        
        // Load channels
        try {
            this.showLoading('Loading channels...');
            const channels = await app.api.getGuildChannels(guildId);
            this.renderChannels(channels);
            this.hideLoading();
        } catch (error) {
            console.error('Error loading channels:', error);
            this.hideLoading();
            alert('Failed to load channels: ' + error.message);
        }
    }

    /**
     * Render channels
     */
    renderChannels(channels) {
        this.channelsList.innerHTML = '';
        this.channels.clear();
        
        // Sort channels by position
        channels.sort((a, b) => a.position - b.position);
        
        // Group by categories
        const categories = channels.filter(c => c.type === 4);
        const textChannels = channels.filter(c => c.type === 0 && !c.parent_id);
        const categorizedChannels = channels.filter(c => c.type === 0 && c.parent_id);
        
        // Render uncategorized text channels
        if (textChannels.length > 0) {
            textChannels.forEach(channel => {
                this.channels.set(channel.id, channel);
                const channelElement = this.createChannelElement(channel);
                this.channelsList.appendChild(channelElement);
            });
        }
        
        // Render categories and their channels
        categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'channel-category';
            categoryDiv.textContent = category.name;
            this.channelsList.appendChild(categoryDiv);
            
            const categoryChannels = categorizedChannels.filter(c => c.parent_id === category.id);
            categoryChannels.sort((a, b) => a.position - b.position);
            
            categoryChannels.forEach(channel => {
                this.channels.set(channel.id, channel);
                const channelElement = this.createChannelElement(channel);
                this.channelsList.appendChild(channelElement);
            });
        });
        
        if (this.channelsList.children.length === 0) {
            this.channelsList.innerHTML = '<div class="no-channel">No text channels available</div>';
        }
    }

    /**
     * Create channel element
     */
    createChannelElement(channel) {
        const div = document.createElement('div');
        div.className = 'channel-item';
        div.dataset.channelId = channel.id;
        
        const icon = document.createElement('span');
        icon.className = 'channel-icon';
        icon.textContent = '#';
        
        const name = document.createElement('span');
        name.textContent = channel.name;
        
        div.appendChild(icon);
        div.appendChild(name);
        
        div.addEventListener('click', () => {
            this.selectChannel(channel.id);
        });
        
        return div;
    }

    /**
     * Select channel
     */
    async selectChannel(channelId) {
        const channel = this.channels.get(channelId);
        if (!channel) return;
        
        this.currentChannel = channel;
        
        // Update UI
        document.querySelectorAll('.channel-item').forEach(el => {
            el.classList.toggle('active', el.dataset.channelId === channelId);
        });
        
        this.currentChannelName.textContent = channel.name;
        this.messageInput.placeholder = `Message #${channel.name}`;
        this.messageInputContainer.style.display = 'block';
        
        // Load messages
        try {
            this.showLoading('Loading messages...');
            const limit = parseInt(this.messageLimitSelect.value);
            const messages = await app.api.getChannelMessages(channelId, limit);
            this.renderMessages(messages.reverse());
            this.hideLoading();
        } catch (error) {
            console.error('Error loading messages:', error);
            this.hideLoading();
            this.messagesContainer.innerHTML = `<div class="no-messages">Failed to load messages: ${error.message}</div>`;
        }
    }

    /**
     * Render messages
     */
    renderMessages(messages) {
        this.messagesContainer.innerHTML = '';
        this.messages.clear();
        
        if (messages.length === 0) {
            this.messagesContainer.innerHTML = '<div class="no-messages">No messages in this channel</div>';
            return;
        }
        
        messages.forEach(message => {
            this.messages.set(message.id, message);
            const messageElement = this.createMessageElement(message);
            this.messagesContainer.appendChild(messageElement);
        });
        
        this.scrollToBottom();
    }

    /**
     * Create message element
     */
    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = 'message';
        div.dataset.messageId = message.id;
        
        // Avatar
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        const avatarUrl = app.api.getUserAvatarURL(message.author, 40);
        if (message.author.avatar) {
            const img = document.createElement('img');
            img.src = avatarUrl;
            img.alt = message.author.username;
            avatar.appendChild(img);
        } else {
            avatar.textContent = message.author.username.charAt(0).toUpperCase();
            // Use predefined accessible colors instead of random colors
            const colors = ['#5865f2', '#3ba55d', '#faa61a', '#ed4245', '#eb459e', '#9c84ef', '#57f287'];
            const colorIndex = parseInt(message.author.id) % colors.length;
            avatar.style.background = colors[colorIndex];
        }
        
        // Content
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const header = document.createElement('div');
        header.className = 'message-header';
        
        const author = document.createElement('span');
        author.className = 'message-author';
        author.textContent = message.author.username;
        
        const timestamp = document.createElement('span');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = app.api.formatTimestamp(message.timestamp);
        
        header.appendChild(author);
        header.appendChild(timestamp);
        content.appendChild(header);
        
        // Message text
        if (message.content) {
            const text = document.createElement('div');
            text.className = 'message-text';
            text.textContent = app.api.parseMentions(message.content);
            content.appendChild(text);
        }
        
        // Attachments
        if (message.attachments && message.attachments.length > 0) {
            message.attachments.forEach(attachment => {
                const attachmentDiv = document.createElement('div');
                attachmentDiv.className = 'message-attachment';
                
                if (attachment.content_type && attachment.content_type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = attachment.url;
                    img.alt = attachment.filename;
                    attachmentDiv.appendChild(img);
                } else {
                    const link = document.createElement('a');
                    link.href = attachment.url;
                    link.textContent = attachment.filename;
                    link.target = '_blank';
                    attachmentDiv.appendChild(link);
                }
                
                content.appendChild(attachmentDiv);
            });
        }
        
        // Embeds
        if (message.embeds && message.embeds.length > 0) {
            message.embeds.forEach(embed => {
                const embedDiv = this.createEmbedElement(embed);
                content.appendChild(embedDiv);
            });
        }
        
        div.appendChild(avatar);
        div.appendChild(content);
        
        return div;
    }

    /**
     * Create embed element
     */
    createEmbedElement(embed) {
        const div = document.createElement('div');
        div.className = 'message-embed';
        
        if (embed.color) {
            div.style.borderLeftColor = '#' + embed.color.toString(16).padStart(6, '0');
        }
        
        if (embed.title) {
            const title = document.createElement('div');
            title.className = 'embed-title';
            title.textContent = embed.title;
            div.appendChild(title);
        }
        
        if (embed.description) {
            const desc = document.createElement('div');
            desc.className = 'embed-description';
            desc.textContent = embed.description;
            div.appendChild(desc);
        }
        
        if (embed.fields && embed.fields.length > 0) {
            const fields = document.createElement('div');
            fields.className = 'embed-fields';
            
            embed.fields.forEach(field => {
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'embed-field';
                
                const fieldName = document.createElement('div');
                fieldName.className = 'embed-field-name';
                fieldName.textContent = field.name;
                
                const fieldValue = document.createElement('div');
                fieldValue.className = 'embed-field-value';
                fieldValue.textContent = field.value;
                
                fieldDiv.appendChild(fieldName);
                fieldDiv.appendChild(fieldValue);
                fields.appendChild(fieldDiv);
            });
            
            div.appendChild(fields);
        }
        
        return div;
    }

    /**
     * Add new message to UI
     */
    addMessage(message) {
        // Only add if we're in the right channel
        if (this.currentChannel && message.channel_id === this.currentChannel.id) {
            const messageElement = this.createMessageElement(message);
            this.messagesContainer.appendChild(messageElement);
            this.scrollToBottom();
            this.messages.set(message.id, message);
        }
    }

    /**
     * Scroll to bottom
     */
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    /**
     * Open settings
     */
    openSettings() {
        this.settingsModal.classList.add('active');
    }

    /**
     * Close settings
     */
    closeSettingsModal() {
        this.settingsModal.classList.remove('active');
    }

    /**
     * Save settings
     */
    saveSettings() {
        const settings = {
            compactMode: this.compactModeCheckbox.checked,
            darkMode: this.darkModeCheckbox.checked,
            messageLimit: this.messageLimitSelect.value
        };
        
        localStorage.setItem('discord-bot-client-settings', JSON.stringify(settings));
    }

    /**
     * Load settings
     */
    loadSettings() {
        const saved = localStorage.getItem('discord-bot-client-settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                
                if (settings.compactMode) {
                    this.compactModeCheckbox.checked = true;
                    document.body.classList.add('compact-mode');
                }
                
                if (settings.darkMode === false) {
                    this.darkModeCheckbox.checked = false;
                    document.body.classList.add('light-mode');
                }
                
                if (settings.messageLimit) {
                    this.messageLimitSelect.value = settings.messageLimit;
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }

    /**
     * Logout
     */
    logout() {
        if (app.gateway) {
            app.gateway.disconnect();
        }
        
        localStorage.removeItem('discord-bot-token');
        location.reload();
    }
}
