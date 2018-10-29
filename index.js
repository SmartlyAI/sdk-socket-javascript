/**
 * smartly-socket-client - Simple customer service built to chat with smartly bots through sockets.
 * @version v1.0.0
 * @author Smartly.ai https://smartly.ai/
 * @date 25/10/2018
 */

var Smartly;

function smartlyClass() {

    /**
     * Smartly class
     *
     * @class Smartly
     */

    Smartly = function (attributs) {

        // Static var
        Smartly.NEW_DIALOG_SESSION = 'NEW_DIALOG_SESSION';
        Smartly.NEW_INPUT = 'NEW_INPUT';
        Smartly.REMOTE_SOCKET_SERVER = 'https://webchat.smartly.ai';
            
        // --- class Attribut's
        // Connect to the remote socket
        this.socket = io.connect(Smartly.REMOTE_SOCKET_SERVER, {
            transports: ['websocket']
        });
        this.user_id = typeof attributs.user_id !== 'undefined' ? attributs.user_id : Date.now();
        this.lang = typeof attributs.lang !== 'undefined' ? attributs.lang : "fr-fr";
        this.skill_id = typeof attributs.skill_id !== 'undefined' ? attributs.skill_id : '';
        this.client_id = null;

        // Create a new user
        this.socket.emit('onNewUser', {
            user_id: this.user_id,
            skill_id: this.skill_id,
            lang: this.lang,
            user_data: {}
        });
        
        // Get the client_id generated from the user_id
        this.socket.on('onGetClient', function (data) {
            this.client_id = data.client_id;
        });
    }

    /**
     * methods of class
     * @property prototype
     * @type Object
     */

    Smartly.prototype = {

        /**
         * When event is trigged.
         * @method on
         * @param   string  event
         * @param   Function  callback
         * @return void
         */
        on: function (event, callback) {
            this.socket.on(event, callback);
        },

        /**
         * Get output from API REST.
         * @method sendRequest
         * @param   JSON  param
         * @return json
         */
        sendRequest: function (param) {
            param.user_data = typeof param.user_data !== 'undefined' ? param.user_data : {},
            param.user_data.sender = (this.user_id).toString();
            
            this.socket.emit('new_log', {
                platform: "webchat", // The platform type that manage sockets 
                user_id: this.user_id,
                skill_id: this.skill_id,
                lang: this.lang,
                event_name: param.event_name,
                user_data: param.user_data,
                input: typeof param.input !== 'undefined' ? param.input : '',
                client_id: this.client_id
            });
        }

    };
}

var headHTML = document.getElementsByTagName('head')[0];
var scoketJsLib = document.createElement('script');
scoketJsLib.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js";
scoketJsLib.onreadystatechange = smartlyClass;

scoketJsLib.onload = function () {
    smartlyClass();
    
    /**
     * Instantiate object from SmartlyClass
     * @param   {string}  skill_id -> skill's ID
     * @param   {string}  user_id -> user's ID. Must be unique
     * @param   {string}  lang -> skill's lang
     * @return {Smartly}
     */
    var dialog = new Smartly({
        skill_id: "XXXXXXX",
        user_id: "userIdcomposedOfLettersAndNumbers123456789",
        lang: "XX-XX"
    });
    
    /**
     * Event for conversation module messages
     * @return {object}
     */
    dialog.on('onMessage', function (message) {
        console.log('Event onMessage')
        console.log(message)
    });

    /**
     * Event for Bot answers
     * @return {object}
     */
    dialog.on('new_log_' + dialog.skill_id, function (message) {
        console.log('Event new_log_' + dialog.skill_id)
        console.log(message);
    });

    /**
     * Example of NEW_DIALOG_SESSION request. Get the message of the welcome state
     * @param   {string}  event_name -> equal to Smartly.NEW_DIALOG_SESSION (required)
     * @param   {object}  user_data -> user's informations (optional)
     */
    dialog.sendRequest({
        event_name: Smartly.NEW_DIALOG_SESSION,
        user_data: {}
    });

    /**
     * Example a NEW_INPUT request with user_data
     * @param   {string}  event_name -> equal to Smartly.NEW_INPUT (required)
     * @param   {string}  input -> user's say (required)
     * @param   {object}  user_data -> user's informations (optional)
     */
    dialog.sendRequest({
        event_name: Smartly.NEW_INPUT,
        input: "XXXXXXX",
        user_data: {
            first_name: 'XXXXXXX', 
            last_name: 'XXXXXXX',
            phone: 'XXXXXXX',
            email: 'XXXXXXX',
            profile_picture: 'XXXXXXX',
            comments: 'XXXXXXX',
            //...
        }
    });
};

headHTML.appendChild(scoketJsLib);
