export default class Chatbot {
    constructor(config) {

        // the config configuration object
        // info about the business, brand, bot, and agency etc
        this.config = config;

        // this is used as a prefix for element class names to avoid conflicts with other elements on the page
        this.agencyCode = `${config.agency.code}-chatbot`;

        // openai stuff
        this.assistant_id = this.config.bot['assistant_id'];
        // todo: should the assistant_id be hidden in addition to the api key?
        this.thread_id = null; // will be set after the first user message
        // Any file in your project
        this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        // todo: figure out some way to hide the api key
        this.openai_headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
        }

        // visibility statuses (either 'visible' or 'hidden')
        // this is referenced and updated when users interact with the config components
        this.status = { // start everything 'hidden'
            icon: 'hidden',
            notice: 'hidden',
            widget: 'hidden',
        }
        // todo: run through these status interactions and ensure they are all functioning as expected

        // used for border colors of many UI components
        this.subtleGrey = '#b9b9b9';

    }
    async init() {
        // this is the main function
        // we are only building the icon and the notice (this .init() is expected to be called on/after page load
        // we are only building the chatbot UI after the icon or the notice is built, no need to build the chatbot UI if the user doesn't interact with the icon or the notice
        console.log('init');
        this.iconBuild();
        this.noticeBuild();
    }

    // icon (the small icon in the corner that appears on the page)
    iconBuild() {
        // build the corner icon that is displayed on the page
        console.log('iconBuild');

        const existingIcon = document.getElementById(`${this.agencyCode}-icon`);
        existingIcon?.remove();

        const icon = document.createElement('div');
        icon.id = `${this.agencyCode}-icon`;
        icon.style.backgroundColor = this.config.brand.colors.primaryDark;
        icon.style.height = '50px';
        icon.style.width = '50px';
        icon.style.borderRadius = '50%';
        icon.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        icon.style.transition = 'all 0.2s ease';
        icon.style.cursor = 'pointer';
        icon.style.zIndex = '9999';
        icon.style.justifyContent = 'center';
        icon.style.alignItems = 'center';
        icon.style.position = 'fixed';
        icon.style.bottom = '15px';
        if (this.config.bot.location === 'bottom-right') {
            icon.style.right = '15px';
        } else if (this.config.bot.location === 'bottom-left') {
            icon.style.left = '15px';
        } else {
            console.error('Invalid page location');
        }
        icon.addEventListener('mouseover', () => { this.iconHover(); });
        icon.addEventListener('mouseout', () => { this.iconUnhover(); });
        icon.addEventListener('click', async () => { await this.iconClick(); });

        // build icon
        const image = document.createElement('img');
        image.src = this.config.brand.iconSrc;
        image.style.borderRadius = '50%';
        image.style.paddingTop = '5px';
        image.style.paddingLeft = '5px';
        image.style.height = '40px';
        image.style.width = '40px';

        // attach
        icon.appendChild(image);
        document.body.appendChild(icon);

        this.status.icon = 'visible';
    }
    iconHover() {
        console.log('iconHover');
        const icon = document.getElementById(`${this.agencyCode}-icon`);
        icon.style.transition = 'all 0.2s ease';
        icon.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        icon.style.transform = 'scale(1.07)';
    }
    iconUnhover() {
        console.log('iconUnhover');
        const icon = document.getElementById(`${this.agencyCode}-icon`);
        icon.style.transition = 'all 0.2s ease';
        icon.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0)';
        icon.style.transform = 'scale(1)';
    }
    async iconClick() {
        console.log('iconClick');
        await this.widgetVisibilityToggle();
    }

    // notice (the small message that appears above the chatbot icon when the chatbot is closed)
    noticeBuild() {
        console.log('noticeBuild');

        // delete any existing notice
        const existingNotice = document.getElementById(`${this.agencyCode}-notice`);
        existingNotice?.remove();

        // create new notice
        const notice = document.createElement('div');
        notice.id = `${this.agencyCode}-notice`;
        notice.style.fontFamily = this.config.brand.font;
        notice.innerHTML = this.config.bot.notice.message;
        notice.style.backgroundColor = this.config.brand.colors.primaryDark;
        notice.style.color = this.config.brand.colors.primaryLight;
        notice.style.padding = '10px';
        notice.style.borderRadius = '5px';
        notice.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        notice.style.transition = 'all 0.2s ease';
        notice.style.cursor = 'pointer';
        notice.style.zIndex = '9999';
        notice.style.position = 'fixed';
        notice.style.bottom = '75px';
        if (this.config.bot.location === 'bottom-right') {
            notice.style.right = '15px';
        } else if (this.config.bot.location === 'bottom-left') {
            notice.style.left = '15px';
        } else {
            console.error('Invalid page location');
        }
        notice.addEventListener('mouseover', () => { this.noticeHover(); });
        notice.addEventListener('mouseout', () => { this.noticeUnhover(); });
        notice.addEventListener('click', async () => { await this.noticeClick(); });

        document.body.appendChild(notice);

        this.status.notice = 'visible';

    }
    noticeHover() {
        console.log('noticeHover');
        const notice = document.getElementById(`${this.agencyCode}-notice`);
        notice.style.transition = 'all 0.2s ease';
        notice.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        notice.style.transform = 'scale(1.07)';
    }
    noticeUnhover() {
        console.log('noticeUnhover');
        const notice = document.getElementById(`${this.agencyCode}-notice`);
        notice.style.transition = 'all 0.2s ease';
        notice.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0)';
        notice.style.transform = 'scale(1)';
    }
    async noticeClick() {
        console.log('noticeClick');

        await this.widgetVisibilityToggle();

    }
    noticeOpen() {
        console.log('noticeOpen');

        const notice = document.getElementById(`${this.agencyCode}-notice`);
        notice.style.display = 'block';

        this.status.notice = 'visible';
    }
    noticeClose() {
        console.log('noticeClose');

        const notice = document.getElementById(`${this.agencyCode}-notice`);
        notice.style.display = 'none';

        this.status.notice = 'hidden';
    }

    // widget (the chatbot itself)
    async widgetBuild() {
        console.log('widgetBuild');

        // delete any existing widget
        const existingWidget = document.getElementById(`${this.agencyCode}-widget`);
        existingWidget?.remove();
        this.thread_id = null; // remove any existing thread_id

        // create new widget
        const widget = document.createElement('div');
        widget.id = `${this.agencyCode}-widget`;
        widget.style.display = 'none'; // start hidden
        widget.style.fontFamily = this.config.brand.font;
        widget.style.position = 'fixed';
        widget.style.height = '550px';
        widget.style.width = '400px';
        widget.style.borderRadius = '10px';
        widget.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        widget.style.transition = 'all 0.2s ease';
        widget.style.zIndex = '9999';
        widget.style.bottom = '75px';
        widget.style.backgroundColor = this.config.brand.colors.primaryLight;
        widget.style.border = '1px solid ' + this.subtleGrey;
        if (this.config.bot.location === 'bottom-right') {
            widget.style.right = '15px';
        } else if (this.config.bot.location === 'bottom-left') {
            widget.style.left = '15px';
        } else {
            console.error('Invalid page location');
        }

        if (this.config.kb.kb) {

            // knowledge base as another tab in the chatbot

        }

        // header
        const header = document.createElement('div');
        header.id = `${this.agencyCode}-widget-header`;
        header.style.borderRadius = '10px 10px 0 0';
        header.style.height = '100px';
        header.style.width = '100%';
        header.style.backgroundColor = this.config.brand.colors.primaryDark;
        header.style.display = 'flex';
        header.style.boxShadow = '0 5px 10px rgba(0, 0, 0, 0.1)';
        header.style.borderBottom = '1px solid ' + this.subtleGrey;

        // refresh (start new thread)
        const refresh = document.createElement('div');
        refresh.id = `${this.agencyCode}-widget-refresh`;
        refresh.innerHTML = '⟳';
        refresh.style.position = 'absolute';
        refresh.style.top = '0';
        refresh.style.right = '31px';
        refresh.style.height = '30px';
        refresh.style.width = '30px';
        refresh.style.border = '1px solid ' + this.subtleGrey;
        refresh.style.borderRadius = '5px';
        refresh.style.backgroundColor = this.config.brand.colors.primaryLight
        refresh.style.color = this.config.brand.colors.primaryDark;
        refresh.style.display = 'flex';
        refresh.style.justifyContent = 'center';
        refresh.style.alignItems = 'center';
        refresh.style.cursor = 'pointer'
        refresh.addEventListener('click', async () => { await this.widgetRefresh(); });

        // minimize
        const minimize = document.createElement('div');
        minimize.id = `${this.agencyCode}-widget-minimize`;
        minimize.innerHTML = '-';
        minimize.style.position = 'absolute';
        minimize.style.top = '0';
        minimize.style.right = '0';
        minimize.style.height = '30px';
        minimize.style.width = '30px';
        minimize.style.border = '1px solid ' + this.config.brand.colors.primaryDark;
        minimize.style.borderRadius = '5px';
        minimize.style.backgroundColor = this.config.brand.colors.primaryLight
        minimize.style.color = this.config.brand.colors.primaryDark;
        minimize.style.display = 'flex';
        minimize.style.justifyContent = 'center';
        minimize.style.alignItems = 'center';
        minimize.style.cursor = 'pointer';
        minimize.addEventListener('click', () => { this.widgetClose(); });

        // header content
        const headerWrap = document.createElement('div');
        headerWrap.id = `${this.agencyCode}-widget-header-content`;
        headerWrap.style.display = 'flex';
        headerWrap.style.flexDirection = 'column';
        headerWrap.style.justifyWrap = 'center';
        headerWrap.style.alignItems = 'center';
        headerWrap.style.position = 'relative';
        headerWrap.style.top = '0';

        // icon, name and slogan wrap
        const headerIconNameSloganWrap = document.createElement('div');
        headerIconNameSloganWrap.style.display = 'flex';
        headerIconNameSloganWrap.style.flexDirection = 'row';
        headerIconNameSloganWrap.style.paddingTop = '20px';
        headerIconNameSloganWrap.style.marginLeft = '20px';
        headerWrap.appendChild(headerIconNameSloganWrap);

        // icon
        const headerIcon = document.createElement('img');
        headerIcon.src = this.config.brand.iconSrc;
        headerIcon.style.height = '50px';
        headerIcon.style.width = '50px';
        headerIcon.style.border = '1px solid ' + this.subtleGrey;
        headerIcon.style.marginTop = '5px';
        headerIcon.style.borderRadius = '50%';
        headerIconNameSloganWrap.appendChild(headerIcon);

        // name and slogan
        const headerNameSloganWrap = document.createElement('div');
        headerNameSloganWrap.style.display = 'flex';
        headerNameSloganWrap.style.flexDirection = 'column';
        headerNameSloganWrap.style.paddingLeft = '16px';
        headerIconNameSloganWrap.appendChild(headerNameSloganWrap);

        // bot name
        const headerBotName = document.createElement('div');
        headerBotName.style.color = this.config.brand.colors.primaryLight;
        headerBotName.style.fontSize = '22px';
        headerBotName.style.fontWeight = 'bold';
        headerBotName.style.paddingBottom = '5px';
        headerBotName.innerHTML = this.config.bot.name;
        headerNameSloganWrap.appendChild(headerBotName);

        // bot slogan
        const headerBotSlogan = document.createElement('div');
        headerBotSlogan.style.color = this.config.brand.colors.primaryLight;
        headerBotSlogan.style.fontSize = '14px';
        headerBotSlogan.style.marginRight = '20px';
        headerBotSlogan.innerHTML = this.config.brand.slogan;
        headerNameSloganWrap.appendChild(headerBotSlogan);

        header.appendChild(headerWrap);
        widget.appendChild(header);

        // input wrap
        const inputWrap = document.createElement('div');
        inputWrap.id = `${this.agencyCode}-widget-input-wrap`;
        inputWrap.style.height = '50px';
        inputWrap.style.position = 'absolute';
        inputWrap.style.justifyContent = 'flex-end'; // Align items to the end (right side)
        inputWrap.style.display = 'flex';
        inputWrap.style.bottom = '0';
        inputWrap.style.boxShadow = '0 -5px 10px rgba(0, 0, 0, 0.1)';
        inputWrap.style.left = '0';
        inputWrap.style.right = '0';
        inputWrap.style.fontFamily = this.config.brand.font;
        inputWrap.style.borderTop = '1px solid ' + this.subtleGrey;
        inputWrap.style.borderRadius = '0 0 10px 10px';
        inputWrap.style.backgroundColor = this.config.brand.colors.primaryLight;
        inputWrap.style.padding = '10px';
        inputWrap.style.color = this.config.brand.colors.primaryDark;
        widget.appendChild(inputWrap);

        // input
        const input = document.createElement('input');
        input.id = `${this.agencyCode}-widget-input`;
        input.placeholder = this.config.bot.widget.input.placeholder;
        input.style.height = '50px';
        input.style.position = 'absolute';
        input.style.bottom = '0';
        input.style.border = 'none';
        input.style.boxShadow = 'none';
        input.style.outline = 'none';
        input.style.padding = '0';
        input.style.margin = '0';
        input.style.background = 'none';
        input.style.left = '0';
        input.style.right = '60px';
        input.style.fontFamily = this.config.brand.font;
        input.style.fontSize = '16px';
        input.style.lineHeight = '16px';
        input.style.borderRadius = '0 0 10px 10px';
        input.style.padding = '10px 20px';
        input.style.backgroundColor = this.config.brand.colors.primaryLight;
        input.style.color = this.config.brand.colors.primaryDark;

        // for some reason, 'this.sendClick' doesn't work in the event listener below
        // wrapping the function in this 'sendClickWorkaroundFunction' function seems to work
        const sendClickWorkaroundFunction = async() => {
            await this.sendClick();
        }

        input.addEventListener('focus', function () {
            document.addEventListener('keypress', async function (event) {
                if (event.key === 'Enter' || event.key === '13') {
                    console.log('enter pressed');
                    await sendClickWorkaroundFunction();
                }
            });
        });
        input.addEventListener('mouseover', () => {
            input.focus();
        });

        // send wrap
        const sendWrap = document.createElement('div');
        sendWrap.id = `${this.agencyCode}-widget-send-wrap`;
        sendWrap.style.height = '72px';
        sendWrap.style.width = '72px';
        sendWrap.style.display = 'flex';
        sendWrap.style.alignItems = 'center'; // Center items vertically
        sendWrap.style.justifyContent = 'center'; // Center items horizontally
        sendWrap.style.cursor = 'pointer';
        sendWrap.style.position = 'absolute';
        sendWrap.style.bottom = '0';
        sendWrap.style.right = '0';
        sendWrap.style.top = '0';
        sendWrap.addEventListener('mouseover', () => { this.sendHover(); });
        sendWrap.addEventListener('mouseout', () => { this.sendUnhover(); });
        sendWrap.addEventListener('click', () => { this.sendClick(); });

        // send button
        const send = document.createElement('div');
        send.id = `${this.agencyCode}-widget-send`;
        send.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
                <g fill="${this.config.brand.colors.primaryDark}">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="m4.01 6.03 7.51 3.22-7.52-1 .01-2.22m7.5 8.72L4 17.97v-2.22l7.51-1M2.01 3 2 10l15 2-15 2 .01 7L23 12 2.01 3z"/>
                </g>
            </svg>`;

        // assemble
        sendWrap.appendChild(send);
        inputWrap.appendChild(input);
        inputWrap.appendChild(sendWrap);
        widget.appendChild(inputWrap);

        // agency branding
        if (
            this.config.agency.branded &&
            this.config.agency.name &&
            this.agencyCode
        ) {
            const agencyBranding = document.createElement('div');
            agencyBranding.style.position = 'absolute';
            agencyBranding.style.bottom = '-22px';
            agencyBranding.style.right = '0';
            agencyBranding.style.left = '0';
            agencyBranding.style.color = '#777';
            agencyBranding.style.display = 'flex';
            agencyBranding.style.justifyContent = 'center';
            agencyBranding.style.alignItems = 'center';
            agencyBranding.style.fontFamily = this.config.brand.font;
            agencyBranding.style.fontSize = '11px';

            if (this.config.agency.url) {
                const agencyLink = document.createElement('a');
                agencyLink.href = `${this.config.agency.url}?utm_campaign=ai-chatbot&utm_source=${window.location.origin}${window.location.pathname}`;
                agencyLink.target = '_blank';
                agencyLink.style.display = 'flex';
                agencyLink.style.alignItems = 'center';
                agencyLink.innerHTML = this.config.agency.name;

                if (this.config.agency.iconSrc) {
                    const agencyIcon = document.createElement('img');
                    agencyIcon.src = this.config.agency.iconSrc;
                    agencyIcon.style.height = '18px';
                    agencyIcon.style.width = '18px';
                    agencyIcon.style.borderRadius = '50%';
                    agencyIcon.style.marginLeft = '5px';
                    agencyLink.appendChild(agencyIcon);

                }

                agencyBranding.innerHTML = `Powered by&nbsp;${agencyLink.outerHTML}`;

            } else {
                agencyBranding.innerHTML = `Powered by&nbsp;${this.config.agency.name}`;
                if (this.config.agency.iconSrc) {

                    const agencyIcon = document.createElement('img');
                    agencyIcon.src = this.config.agency.iconSrc;
                    agencyIcon.style.height = '18px';
                    agencyIcon.style.width = '18px';
                    agencyIcon.style.borderRadius = '50%';
                    agencyIcon.style.marginLeft = '5px';
                    agencyBranding.appendChild(agencyIcon);

                }
            }

            this.status.widget = 'visible';
            widget.appendChild(agencyBranding);

        }

        const chatbox = document.createElement('div');
        chatbox.id = `${this.agencyCode}-widget-chatbox`;
        chatbox.style.overflowY = 'scroll'; // Enable vertical scrolling
        chatbox.style.transition = 'scroll-behavior 0.5s ease-in-out;' // smooth scroll
        chatbox.style.height = '378px';

        widget.style.display = 'block';
        widget.appendChild(chatbox);
        header.appendChild(refresh);
        header.appendChild(minimize);
        document.body.appendChild(widget);

        // get page pathname
        let pathName = window.location.pathname;
        const suggestionsArray = this.config.bot.suggestions[pathName] || this.config.bot.suggestions['default'];
        this.suggestionBuildAll(suggestionsArray);

    }
    async widgetOpen() {
        console.log('widgetOpen');

        this.noticeClose();

        //  building widget only on open
        const widget = document.getElementById(`${this.agencyCode}-widget`);
        if (widget) {
            widget.style.display = 'block';
        } else {
            await this.widgetBuild();
        }

        // focus input
        const input = document.getElementById(`${this.agencyCode}-widget-input`);
        input.focus();

        this.status.widget = 'visible';
    }
    widgetClose() {
        console.log('widgetClose');

        this.noticeOpen();

        // hide widget
        const widget = document.getElementById(`${this.agencyCode}-widget`);
        widget.style.display = 'none';

        this.status.widget = 'hidden';
    }
    async widgetRefresh() {
        // here we are simply removing the existing widget and rebuilding it as a way to refresh the chatbot
        // a new thread will be created with the first user message
        console.log('widgetRefresh');

        // there is 'delete existing' functionality at the start of the 'widgetBuild' function
        await this.widgetBuild();
    }
    async widgetVisibilityToggle() {
        console.log('widgetVisibilityToggle');

        if (this.status.widget === 'visible') {
            this.widgetClose();
        } else if (this.status.widget === 'hidden') {
            await this.widgetOpen();
            await this.aiWelcomeMessageIfNoThreadId();
        }
    }

    async aiWelcomeMessageIfNoThreadId() {
        console.log('aiWelcomeMessageIfNoThreadId');

        if (!this.thread_id) {
            await this.addAiMessageBubble({
                message: this.config.bot.welcomeMessages.default
            });
        }

    }

    // suggestions (misc. functions)
    suggestionBuildAll(suggestionsArray) {
        console.log('suggestionBuildAll');

        if (suggestionsArray) {

            // create suggestion wrapper (allowing inline-block)
            const suggestionContainer = document.createElement('div');
            suggestionContainer.className = `${this.agencyCode}-suggestion-container`; // using 'container' as a class name as the 'suggestions' already utilize a 'wrapper'
            suggestionContainer.style.display = 'flex';
            suggestionContainer.style.flexWrap = 'wrap';
            suggestionContainer.style.justifyContent = 'right';
            suggestionContainer.style.alignItems = 'center';
            suggestionContainer.style.margin = '10px';

            // 60% width of the chatbox, up against the right side
            suggestionContainer.style.width = '65%';
            suggestionContainer.style.position = 'absolute';
            suggestionContainer.style.bottom = '70px';
            suggestionContainer.style.right = '0';

            // append
            const chatbox = document.getElementById(`${this.agencyCode}-widget-chatbox`);
            chatbox.appendChild(suggestionContainer);

            // add suggestions
            for (let i = 0; i < suggestionsArray.length; i++) {

                // individual styling, event listeners and appending is done in the 'suggestionBuild' function
                this.suggestionBuild(suggestionsArray[i]);
            }
        } else {
            console.error('No suggestions provided');
        }

    }
    suggestionBuild(suggestionText) {
        console.log('suggestionBuild');

        // create suggestion wrapper (used for right-aligning)
        const suggestionWrapper = document.createElement('div');
        suggestionWrapper.className = `${this.agencyCode}-suggestion-wrapper`;
        suggestionWrapper.style.textAlign = 'right';
        suggestionWrapper.style.textAlign = 'right';

        // create suggestion
        const suggestion = document.createElement('div');
        suggestion.className = `${this.agencyCode}-suggestion`;
        suggestion.innerHTML = suggestionText;
        suggestion.style.cursor = 'pointer';
        suggestion.style.transition = 'all 0.2s ease';
        suggestion.style.padding = '10px';
        suggestion.style.margin = '3px';
        suggestion.style.borderRadius = '6px';
        suggestion.style.display = 'inline-block';
        suggestion.style.border = '1px solid ' + this.subtleGrey;
        suggestion.style.backgroundColor = this.config.brand.colors.primaryLight;
        suggestion.style.color = this.config.brand.colors.primaryDark;
        suggestion.addEventListener('mouseover', () => { this.suggestionHover(suggestion); });
        suggestion.addEventListener('mouseout', () => { this.suggestionUnhover(suggestion); });
        suggestion.addEventListener('click', async () => { this.suggestionClick(suggestionText); });

        // append
        suggestionWrapper.appendChild(suggestion);

        const suggestionContainer = document.querySelector(`.${this.agencyCode}-suggestion-container`);
        suggestionContainer.appendChild(suggestionWrapper);

        // scroll to bottom
        this.scrollToBottomOfChatbox();
    }
    suggestionHover(suggestion) {
        console.log('suggestionHover');
        suggestion.style.backgroundColor = this.config.brand.colors.primaryDark;
        suggestion.style.color = this.config.brand.colors.primaryLight;
    }
    suggestionUnhover(suggestion) {
        console.log('suggestionUnhover');
        suggestion.style.backgroundColor = this.config.brand.colors.primaryLight;
        suggestion.style.color = this.config.brand.colors.primaryDark;
    }
    async suggestionClick(suggestionText) {
        console.log('suggestionClick');
        // the input.value is what is then processed by the sendClick function
        document.getElementById(`${this.agencyCode}-widget-input`).value = suggestionText;
        await this.sendClick();
    }

    // send (ui for a user to send a message)
    sendHover() {
        console.log('sendHover');
        const send = document.getElementById(`${this.agencyCode}-widget-send-wrap`);
        send.style.transition = 'all 0.2s ease';
        send.style.transform = 'scale(1.07)';
    }
    sendUnhover() {
        console.log('sendUnhover');
        const send = document.getElementById(`${this.agencyCode}-widget-send-wrap`);
        send.style.transition = 'all 0.2s ease';
        send.style.transform = 'scale(1)';
    }
    async sendClick() {
        console.log('sendClick');

        // remove any suggestions
        const suggestions = document.querySelectorAll(`.${this.agencyCode}-suggestion-wrapper`);
        for (let i = 0; i < suggestions.length; i++) {
            suggestions[i].remove();
        }

        // capture input
        const input = document.getElementById(`${this.agencyCode}-widget-input`);
        const messageText = input.value;
        if (messageText.length < 1) {
            return;
        }

        this.addUserMessageBubble(messageText);
        this.addAiMessageBubble({
            message: `
                <div style="width: 35px">
                    <div style="padding-left: 12px">
                        <div class="dot-pulse"></div>
                        <style>
                            .dot-pulse {
                              position: relative;
                              left: -9999px;
                              width: 10px;
                              height: 10px;
                              border-radius: 5px;
                              background-color: ${this.config.brand.colors.primaryLight};
                              color: ${this.config.brand.colors.primaryLight};
                              box-shadow: 9999px 0 0 -5px;
                              animation: dot-pulse 1.5s infinite linear;
                              animation-delay: 0.25s;
                            }
                            .dot-pulse::before, .dot-pulse::after {
                              content: "";
                              display: inline-block;
                              position: absolute;
                              top: 0;
                              width: 10px;
                              height: 10px;
                              border-radius: 5px;
                              background-color: ${this.config.brand.colors.primaryLight};
                              color: ${this.config.brand.colors.primaryLight};
                            }
                            .dot-pulse::before {
                              box-shadow: 9984px 0 0 -5px;
                              animation: dot-pulse-before 1.5s infinite linear;
                              animation-delay: 0s;
                            }
                            .dot-pulse::after {
                              box-shadow: 10014px 0 0 -5px;
                              animation: dot-pulse-after 1.5s infinite linear;
                              animation-delay: 0.5s;
                            }
                            @keyframes dot-pulse-before {
                              0% {
                                box-shadow: 9984px 0 0 -5px;
                              }
                              30% {
                                box-shadow: 9984px 0 0 2px;
                              }
                              60%, 100% {
                                box-shadow: 9984px 0 0 -5px;
                              }
                            }
                            @keyframes dot-pulse {
                              0% {
                                box-shadow: 9999px 0 0 -5px;
                              }
                              30% {
                                box-shadow: 9999px 0 0 2px;
                              }
                              60%, 100% {
                                box-shadow: 9999px 0 0 -5px;
                              }
                            }
                            @keyframes dot-pulse-after {
                              0% {
                                box-shadow: 10014px 0 0 -5px;
                              }
                              30% {
                                box-shadow: 10014px 0 0 2px;
                              }
                              60%, 100% {
                                box-shadow: 10014px 0 0 -5px;
                              }
                            }
                        </style>
                    </div>
                </div>
              `,
            media: [],
            ctaArray: [],
            loading: true // indicates a loading message
        });

        input.value = '';
        input.focus();

        if (!this.thread_id) {
            await this.firstUserMessage({
                assistant_id: this.assistant_id,
                messageText
            });

        } else {
            await this.userMessage({
                assistant_id: this.assistant_id,
                thread_id: this.thread_id,
                messageText,
            })
        }
    }

    // OpenAI API interactions
    // https://platform.openai.com/docs/assistants/whats-new
    async firstUserMessage({assistant_id, messageText}) {
        console.log('firstUserMessage');

        try {

            let run = await fetch('https://api.openai.com/v1/threads/runs/', {
                method: 'POST',
                headers: this.openai_headers,
                body: JSON.stringify({
                    assistant_id,
                    thread: { messages: [{ role: "user", content: messageText }] }
                })
            }).then(response => response.json());

            return await this.awaitResponse(run);

        } catch (error) {
            console.error('Error in firstUserMessage:', error);
            throw error; // Propagate the error for handling in the calling code
        }
    }
    async userMessage({assistant_id, thread_id, messageText}) {
        console.log('userMessage');

        try {

            const run = await fetch(`https://api.openai.com/v1/threads/${thread_id}/runs`, {
                method: 'POST',
                headers: this.openai_headers,
                body: JSON.stringify({
                    assistant_id,
                    additional_messages: [
                        { role: "user", content: messageText }
                    ]
                })
            }).then(response => response.json());

            this.awaitResponse(run);

        } catch (error) {
            console.error('Error in userMessage:', error);
        }
    }
    async awaitResponse(run) {
        // throttling the requests to openai, awaiting for a completion of a run to get the returned messages
        // todo: what is 'streaming' as defined by openai? would this reduce api calls and speed up completed returns?
        console.log('awaitResponse');

        while(['queued', 'in_progress', 'cancelling'].includes(run.status)) {
            await new Promise(resolve => setTimeout(resolve, 500));
            this.thread_id = run.thread_id;

            async function runGet({headers, thread_id, run_id}) {
                // get a run from openai
                console.log('runGet');
                try {
                    return await fetch(`https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`, {
                        method: 'GET',
                        headers
                    }).then(response => response.json());
                } catch (e) {
                    console.error('Error in runGet:', e.message, e);
                }
            }
            run = await runGet({
                headers: this.openai_headers,
                thread_id: this.thread_id,
                run_id: run.id
            });


            if (run.status === 'requires_action') {

                console.log(run);

                const tool_outputs = run.required_action.submit_tool_outputs.tool_calls.map(tool => {
                    console.log(tool.function.name);

                    switch (tool.function.name) {
                        case "get_contact_information":
                            return {
                                tool_call_id: tool.id,
                                output: 'https://botanikaresort.com',
                            }
                    }
                });

                async function submit_tool_outputs({headers, thread_id, run_id, tool_outputs}) {
                    // submit tool outputs back to openai when a function requires action
                    console.log('submit_tool_outputs');
                    try {
                        return await fetch(`https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}/submit_tool_outputs`, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({tool_outputs})
                        }).then(response => response.json());
                    } catch (e) {
                        console.error('Error in submit_tool_outputs:', e.message, e);
                    }

                }
                await submit_tool_outputs({
                    headers: this.openai_headers,
                    thread_id: this.thread_id,
                    run_id: run.id,
                    tool_outputs
                });
            }
        }

        // wait 10 seconds
        await new Promise(resolve => setTimeout(resolve, 7000));
        // todo: this needs to be throttled (or streamed)
        let messages = await fetch(`https://api.openai.com/v1/threads/${this.thread_id}/messages`, {
            method: 'GET',
            headers: this.openai_headers,
        }).then(response => response.json());

        messages.data.reverse();

        const lastMessage = messages.data[messages.data.length - 1];
        console.log(lastMessage);

        let lastMessageContent = lastMessage.content[0].text.value;

        function convertMarkdownImageToHTML({input}) {
            console.log('convertMarkdownImageToHTML');
            try {
                const newImage = input.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, `<div style="background-color: #fff; margin-top: 10px; margin-bottom: 10px; padding: 5px 5px 2px; box-shadow: #474747 0 0 6px; border-radius: 6px; overflow: hidden; width: fit-content"><a title="$1" target="_blank" href="$2"><img style="max-width: 100%;" alt="$1" src="$2" /></a></div>`)
                return newImage.endsWith('.') ? newImage.slice(0, -1) : newImage; // remove trailing period (sometimes openai returns an image with a trailing period)
            } catch (e) {
                console.error('Error in convertMarkdownImageToHTML:', e.message, e);
                return input;
            }
        }
        function convertMarkdownLinkToHTML({input, linkColor}) {
            console.log('convertMarkdownLinkToHTML');
            try {
                const newLink = input.replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, `<a style="color: ${linkColor}; font-weight: 600; margin-top: 10px; margin-bottom: 10px;" title="$1" target="_blank" href="$2">$1</a>`);
                return newLink.endsWith('.') ? newLink.slice(0, -1) : newLink; // remove trailing period (sometimes openai returns a link with a trailing period)
            } catch (e) {
                console.error('Error in convertMarkdownLinkToHTML:', e.message, e);
                return input;
            }
        }

        const lastMessageContentArray = lastMessageContent.split('\n');
        lastMessageContentArray.forEach((item, i) => {

            // calling 'convertMarkdownImage' before 'convertMarkdownLink'
            // 'convertMarkdownLink' contains a looks for a regex pattern that is also present in 'convertMarkdownImage'
            // by converting images first, we avoid the regex pattern in 'convertMarkdownLink' from matching the image markdown
            const linkColor = this.config.brand.colors.primaryLight;
            item = convertMarkdownImageToHTML({ input: item });
            item = convertMarkdownLinkToHTML({ input: item, linkColor: linkColor });

            if (!item) {
                lastMessageContentArray[i] = `<div style="display: block; padding-top: 5px; padding-bottom: 15px;"><div style="background-color: #fff; height: 1px;"></div></div>`;
            } else {
                if (item.includes('###')) {
                    item = item.replace('###', '');
                    lastMessageContentArray[i] = `<span style="display: block; margin-bottom: 10px; font-weight: 600;">${item}</span>`;
                } else {
                    lastMessageContentArray[i] = `<span style="display: block; margin-bottom: 10px;">${item}</span>`;
                }
            }
        })

        // join the array back into a string
        lastMessageContent = lastMessageContentArray.join('');

        // remove annotations from text, logging them for reference
        const annotations = lastMessage.content[0].text.annotations;
        annotations?.forEach(annotation => {
            console.log(annotation);
            lastMessageContent = lastMessageContent.replace(annotation.text, '');
        });

        // bold anything inside a double asterisk
        lastMessageContent = lastMessageContent.replaceAll(/\*\*([^*]+)\*\*/g, '<span style="font-weight: 600;">$1</span>');

        // bold all text on a line if it starts with ### and remove the ###
        lastMessageContent = lastMessageContent.replaceAll(/###([^#]+)###/g, '<span style="font-weight: 600;">$1</span>');

        // remove all dashes (-) if they have a space before and after
        lastMessageContent = lastMessageContent.replaceAll(/ - /g, ' ');

        const media = [];
        const callToActions = [
            {
                text: 'Click me!',
                url: 'https://www.google.com'
            },
            {
                text: 'Click me too!',
                url: 'https://www.google.com'
            }
        ]

        this.addAiMessageBubble({
            message: lastMessageContent,
            media: media || [],
            ctaArray: callToActions || []
        });
    }

    // https://stackoverflow.com/questions/66472149/css-bubble-chat-slide-up-animation
    async addUserMessageBubble(message) {
        console.log('addUserMessageBubble');
        try {

            // create user message bubble
            const userMessageBubble = document.createElement('div');
            userMessageBubble.className = `${this.agencyCode}-user-message`;
            userMessageBubble.innerHTML = message;

            // style
            const readyElement = this.messageBubbleStyling(userMessageBubble);

            // append to chatbox
            const chatbox = document.getElementById(`${this.agencyCode}-widget-chatbox`);
            chatbox.appendChild(readyElement);

            // open widget if closed
            if (this.status.widget === 'hidden') {
                await this.widgetOpen();
            }

            // scroll to bottom
            this.scrollToBottomOfChatbox();

        } catch (e) {
            console.error('Error in addUserMessageBubble:', e.message, e);
        }
    }

    addAiMessageBubbleCta(cta_object) {
        // here we are creating a UI button for the call to action
        // cta_object is expected to contain both a 'text' key (button text) and a 'url' key (button url)
        // todo: add button link functionality
        // todo: styling could be refined for the button
        console.log('addAiMessageBubbleCta');
        try {
            // create CTA
            const cta = document.createElement('div');
            cta.style.color = this.config.brand.colors.primaryDark;
            cta.style.backgroundColor = this.config.brand.colors.primaryLight;
            cta.style.display = 'inline-block';
            cta.style.marginRight = '6px';
            cta.style.marginBottom = '10px';
            cta.style.padding = '6px';
            cta.style.textAlign = 'left';
            cta.style.borderRadius = '6px';
            cta.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
            cta.style.cursor = 'pointer';
            cta.style.border = '1px solid ' + this.subtleGrey;
            cta.style.transition = 'all 0.2s ease';
            cta.innerHTML = cta_object.text;
            cta.addEventListener('mouseover', () => { cta.style.transform = 'scale(1.04)' });
            cta.addEventListener('mouseout', () => { cta.style.transform = 'scale(1)'; });
            cta.addEventListener('click', () => { console.log('cta clicked'); });
            return cta;
        } catch (e) {
            console.error('Error in addAiMessageBubbleCta:', e.message, e);
        }
    }
    async addAiMessageBubble({message, media, ctaArray, loading = false}) {
        // here we are creating the ai message bubble
        // handles logic for loading messages, media and call to actions
        // styling is done in the messageBubbleStyling function
        // todo: where will media (images) be handled? here? or in the awaitResponse function?
        console.log('addAiMessageBubble');
        try {
            document.getElementById(`${this.agencyCode}-ai-message-loading-wrapper`)?.remove();

            // create ai message bubble
            const aiMessageBubble = document.createElement('div');
            aiMessageBubble.className = `${this.agencyCode}-ai-message`;
            aiMessageBubble.innerHTML = message;

            // add media
            if (media?.length > 0) {

                // create container
                const mediaContainer = document.createElement('div');
                mediaContainer.className = `${this.agencyCode}-ai-message-media-container`;
                mediaContainer.style.display = 'flex';
                mediaContainer.style.flexWrap = 'wrap';
                mediaContainer.style.justifyContent = 'left';
                mediaContainer.style.alignItems = 'center';
                mediaContainer.style.marginTop = '10px';
                mediaContainer.style.marginBottom = '10px';

                // add media
                media?.forEach(media_object => {
                    if (media_object.type === 'image') {
                        const media = document.createElement('img');
                        media.src = media_object.url;
                        media.style.borderRadius = '6px';
                        media.style.marginRight = '6px';
                        media.style.marginLeft = '6px';
                        media.style.marginTop = '10px';
                        media.style.marginBottom = '0';
                        media.style.height = '100%';
                        media.style.width = '100%';
                        mediaContainer.appendChild(media);
                    }
                });
                aiMessageBubble.appendChild(mediaContainer);

            }

            // add call to actions
            ctaArray?.forEach(cta_object => {
                const cta = this.addAiMessageBubbleCta(cta_object);
                aiMessageBubble.appendChild(cta);
            });

            // style
            const readyElement = this.messageBubbleStyling(aiMessageBubble, loading);

            // append to chatbox
            const chatbox = document.getElementById(`${this.agencyCode}-widget-chatbox`);
            chatbox.appendChild(readyElement);

            // open widget if closed
            if (this.status.widget === 'hidden') {
                await this.widgetOpen();
            }

            // scroll to bottom
            this.scrollToBottomOfChatbox();
        } catch (e) {
            console.error('Error in addAiMessageBubble:', e.message, e);
        }
    }
    messageBubbleStyling(bubbleEl, loading = false) {
        // this function styling for both displaying the user and ai messages
        // some styling reused for both message types, some specific to user or ai messages
        // todo: styling could be refined
        console.log('messageBubbleStyling');
        try {

            // wrapper (used for vertical ordering)
            const wrapper = document.createElement('div');

            // is loading (ai)
            if (loading) {
                wrapper.id = `${this.agencyCode}-ai-message-loading-wrapper`;
            }

            // timestamp
            const timestamp = document.createElement('div');
            timestamp.style.color = '#777';
            timestamp.style.fontSize = '12px';
            timestamp.style.marginTop ='0px';
            timestamp.style.marginBottom = '10px';
            timestamp.style.marginLeft = '12px';
            timestamp.style.marginRight = '19px'; //  giving some space to the scrollbar on the right side
            timestamp.innerHTML = getCurrentTimeFormatted();
            function getCurrentTimeFormatted() {
                const now = new Date();
                let hours = now.getHours();
                const minutes = now.getMinutes();
                const amPm = hours >= 12 ? 'PM' : 'AM';

                // Convert hours to 12-hour format
                hours = hours % 12;
                hours = hours ? hours : 12; // If 'hours' is 0, set it to 12

                // Format minutes to always be two digits
                const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

                // Format the time in desired format (e.g., 5:35 PM)
                return hours + ':' + formattedMinutes + ' ' + amPm;
            }

            // bubble styles valid for both the ai messages and the user messages
            bubbleEl.style.padding = '20px';
            bubbleEl.style.fontFamily = this.config.brand.font;
            bubbleEl.style.margin = '5px 10px';
            bubbleEl.style.borderRadius = '6px';
            bubbleEl.style.display = 'inline-block';
            bubbleEl.style.maxWidth = '80%';

            const className = bubbleEl.className; // using className as a styling indication (className set in the addUserMessageBubble and addAiMessageBubble functions)

            // user message-specific styling
            if (className === `${this.agencyCode}-user-message`) {
                bubbleEl.style.position = 'relative';
                bubbleEl.style.right = '0';
                bubbleEl.style.color = this.config.brand.colors.primaryDark;
                bubbleEl.style.backgroundColor = this.config.brand.colors.primaryLight;
                bubbleEl.style.margin = '5px 17px'; // upping from default right side margin set above to give breathing room to the scrollbar
                bubbleEl.style.border = '1px solid ' + this.subtleGrey;
                bubbleEl.style.textAlign = 'right';
                timestamp.style.textAlign = 'right';
                wrapper.style.textAlign = 'right';

                // ai message-specific styling
            } else if (className === `${this.agencyCode}-ai-message`) {
                bubbleEl.style.paddingBottom = '10px';
                bubbleEl.style.position = 'relative';
                bubbleEl.style.left = '0';
                bubbleEl.style.color = this.config.brand.colors.primaryLight;
                bubbleEl.style.backgroundColor = this.config.brand.colors.primaryDark;
                bubbleEl.style.textAlign = 'left';
                timestamp.style.textAlign = 'left';
                timestamp.style.marginLeft = '63px';
                wrapper.style.textAlign = 'left';

            } else {
                console.error('invalid bubbleEl.className');
            }

            if (className === `${this.agencyCode}-ai-message`) {

                const bubbleIconWrapper = document.createElement('div');
                bubbleIconWrapper.style.display = 'flex';

                const bubbleIcon = document.createElement('img');
                bubbleIcon.src = this.config.brand.iconSrc;
                bubbleIcon.style.border = '1px solid ' + this.subtleGrey;
                bubbleIcon.style.borderRadius = '50%';
                bubbleIcon.style.height = '40px';
                bubbleIcon.style.width = '40px';
                bubbleIcon.style.marginRight = '2px';
                bubbleIcon.style.marginTop = '10px';
                bubbleIcon.style.marginBottom = '10px';
                bubbleIcon.style.marginLeft = '10px';
                bubbleIcon.style.float = 'left';
                bubbleIcon.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';

                bubbleIconWrapper.appendChild(bubbleIcon);
                bubbleIconWrapper.appendChild(bubbleEl);

                wrapper.appendChild(bubbleIconWrapper);
                wrapper.appendChild(timestamp);

            } else {
                wrapper.appendChild(bubbleEl);
                wrapper.appendChild(timestamp);
            }

            return wrapper;

        } catch (e) {
            console.error('Error in messageBubbleStyling:', e.message, e);
        }
    }
    scrollToBottomOfChatbox() {
        // here we are just scrolling to the bottom of the chatbot
        // under the assumption that the user would want to see the latest messages
        console.log('scrollToBottom');
        try {
            const chatbox = document.getElementById(`${this.agencyCode}-widget-chatbox`);
            chatbox.scrollTop = chatbox.scrollHeight;
        } catch (e) {
            console.error('Error in scrollToBottomOfChatbox:', e.message, e);
        }
    }
    playAudio() {
        // this function is used to play a sound when both a user and ai message is sent
        // todo: this function is currently not being used
        console.log('playAudio');
    }

}
