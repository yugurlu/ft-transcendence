import {request} from "./Request.js";
import {notify} from "../components/Notification.js";
import {getProfile} from "./utils.js";
import {createInbox} from "./inbox.js";

export const API_URL = 'http://localhost:8000/api/v1';
export const BASE_URL = 'http://localhost:8000';
export const API_42_URL = 'https://api.intra.42.fr'
export const WEBSOCKET_URL = 'ws://localhost:8000/ws'
let currentScript = null;

export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

const routes = new Map([
    ['login', {
        auth_required: false,
        url: ["/auth/login/"],
        html: `
    <div class="background container-fluid">
        <div class="d-flex align-items-center justify-content-center h-100">
            <form class="login-wrapper p-5 gap-2" id="login-form">
                <div
                        style="
                display: flex;
                align-items: center;
                justify-content: center;
              "
                >
                    <h1 style="color: white">LOGIN</h1>
                </div>
                <div>
                    <input
                            type="text"
                            class="login-input p-2"
                            id="username"
                            placeholder="USERNAME"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        class="login-input p-2"
                        id="password"
                        placeholder="PASSWORD"
                    />
                </div>
                <div class="buttons-wrapper">
                    <button class="login-button" id="login-button" type="submit">LOGIN</button>
                    <pong-redirect href="/auth/register/">
                        <button class="login-button" type="button">REGISTER</button>
                    </pong-redirect>
                </div>
                <button class="ecole-login-button" id="ecole-login-button" type="button">
                    Login with 42
                    <div>
                        <img src="/static/public/42.svg" alt=""/>
                    </div>
                </button>
            </form>
        </div>
    </div>
`
    }],
    ['register', {
        auth_required: false,
        url: ["/auth/register/"],
        html: `
              <div class="background container-fluid">
            <div class="d-flex align-items-center justify-content-center h-100">
              <form class="register-wrapper p-5 gap-2" id="register-form">
              <pong-redirect class="register-back" href="/auth/login/">
                  <img src="/static/public/go-back.svg" alt="">
              </pong-redirect>
                <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <h1 style="color: white">REGISTER</h1>
                </div>
                <div class="register-input-wrapper">
                  <label for="username">username</label>
                  <input
                    type="text"
                    class="register-input p-2"
                    placeholder="USERNAME"
                    id="username"
                  />
                </div>
                <div class="register-password">
                  <div class="register-input-wrapper">
                    <label for="password">password</label>
                    <input
                      type="password"
                      class="register-input p-2"
                      placeholder="PASSWORD"
                      id="password"
                      required
                    />
                  </div>
                  <div class="register-input-wrapper">
                    <label for="password">Re enter your password</label>
                    <input
                      type="password"
                      class="register-input p-2"
                      id="password2"
                      required
                    />
                  </div>
                </div>
                <div class="register-input-wrapper">
                  <label for="Email">Email</label>
                  <input
                    type="text"
                    class="register-input p-2"
                    placeholder="EMAIL"
                    id="email"
                    required
                  />
                </div>
                <div
                  style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    width: 100%;
                  "
                >
                  <div>
                    <button class="register-button" id="register-button">
                        REGISTER
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
    `
    }],
    ['profile', {
        auth_required: true,
        url: [/profile\/[A-Za-z]+/],
        html: `


              <div
        class="background container-fluid social-background"
        style="padding: 0"
      >
        <div class="profile-wrapper">
          <div class="profile-info" id="profile-info">
            <div class="profile-info-wrapper">
                <div class="profile-edit">
                    <button class="pong-button" id="edit-button">
                        <img src="/static/public/edit.svg" alt=""></button>
                </div>
              <div class="profile-photo skeleton"></div>
              <div class="skeleton profile-data">
                <h1 class="profile-nickname"></h1>
                <span></span>
              </div>
              <div class="profile-bio skeleton">
                <p></p>
              </div>
            </div>
          </div>
          <div class="profile-data">
            <div class="data-headers">
              <button class="header-wrapper" id="history-button"><span>MATCH HISTORY</span></button>
              <button class="header-wrapper" id="friends-button"><span> FRIENDS </span></button>
              <button class="header-wrapper" id="stats-button"><span>STATS</span></button>
              <button class="header-wrapper" id="blocked-users-button"><span>BLOCKED</span></button>
              <button class="header-wrapper" id="paddle-color-button"><span>PADDLE COLOR</span></button>
            </div>
          <div id="data-wrapper">
            </div>
          </div>
          </div>
        </div>
      </div>
`
    }],
    ['social', {
        auth_required: true,
        url: ['/social/', '/social/\\w+/g'],
        html: `
      <ul class="chat-options" id="chat-options">
        <li id="options-invite-to-pong">Invite to Pong</li>
        <pong-redirect id="profile-redirect">Go To Profile</pong-redirect>
          <li id="options-block-user">Block</li>
          <li id="options-add-friend">Add Friend</li>
      </ul>

      
          <div
        class="background container-fluid social-background"
        style="padding: 0"
      >
        <div class="d-flex h-100">
          <div class="d-flex position-relative">
            <div id="user-chat-friends">
                <div class="users-wrapper">
                <div>
                  <form class="chat-send-wrapper">
                    <h2>SEARCH...</h2>
                    <input type="text" placeholder="SEARCH A NAME" id="user-search-input" />
                </form>
              </div>
              <div class="user-data-wrapper loading" id="user-data-wrapper">
              <div class="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            </div>
              </div>
            </div>
            </div>
            <div class="chat-container" id="chat-container">
               <div class="active-user-wrapper">
                <div class="user-info" id="active-user-info">
                  <div class="user-pic-wrapper">
                    <img
                      src="https://picsum.photos/seed/picsum/200/300"
                      alt=""
                    />
                  </div>
                  <div class="active-user-info-wrapper">
                    <h6></h6>
                  </div>
                </div>
                <div class="d-flex">
                  <div id="chat-close-button"  style="cursor: pointer">
                    <img  src="/static/public/go-back.svg" alt="" />
                  </div>
                </div>
              </div>
              <div class="conversation-wrapper no-chat-wrapper" id="conversation-wrapper">
                Select a user to start a conversation
              </div>
              <form class="send-container" style="margin-bottom: 1px" id="chat-send">
                <input
                  type="text"
                  name=""
                   id="chat-input"
                  placeholder="Send a message"
                  style="width: 100%"
                />
                <div>
                  <img  src="/static/public/send.svg" alt="" />
                </div>
              </form>
            </div>
          </div>
          <div class="social-container py-2" id="social-container">
            <div
              class="social-wrapper"
              id="social-wrapper"
            >
              <div class="d-flex flex-column gap-2">
                <div class="social-send-info">
                  <div class="user-pic-wrapper">
                    <img
                      src="https://picsum.photos/seed/picsum/200/300"
                      alt=""
                    />
                  </div>
                  <h6 id="username">Test1</h6>
                </div>
                <form class="social-send" id="social-send-form">
                  <input
                    type="text"
                    name=""
                    id="social-text-input"
                    style="background-color: rgba(126, 126, 126, 0.397)"
                    placeholder="What do you think"
                  />
                    <div class="form-input-wrapper">
                    <label for="image-add" class="custom-file-upload"></label>
                    <input
                    type="file" id="image-add"
                    src="{% static '/public/image.svg' %}" alt="" style="width: 35px"
                    accept="image/jpeg,image/png,image/gif"
                    >
                <button type="submit" id="send-button">
                    <img src="/static/public/send.svg" alt="" />
                </button>
                    </div>
                </form>
              </div>
              <div class="posts-container" id="posts-wrapper">
                <div class="post-container skeleton" id="post-wrapper">
                </div>
              </div>
            </div>
        </div>
        </div>
      </div>
`
    }],
    ['home', {
        auth_required: true,
        url: ['/home/'],
        html: `
      <div
        class="container-fluid position-relative home-wrapper"
        style="padding: 0"
      >
        <pong-redirect  class="home-element" id="single-menu" href="/play/">
          <h1>Singleplayer</h1>
        </pong-redirect >
        <pong-redirect class="home-element" id="multi-menu" href="/matchmaking/">
          <h1>Multiplayer</h1>
        </pong-redirect>
        <pong-redirect  class="home-element" id="tournament-menu" href="/tournaments/">
          <h1>Tournament</h1>
        </pong-redirect >
        <pong-redirect  class="home-element" id="social-menu" href="/social/">
          <h1>Social</h1>
        </pong-redirect >
      </div>
              `
    }],
    ['verification', {
        auth_required: false,
        url: ['/verification/'],
        html: `
             <div class="background container-fluid">
        <div class="d-flex align-items-center justify-content-center h-100">
            <div class="verification-wrapper">
                <h2>E-mail Verification</h2>
                
                <p>Please type verification code sent to your e-mail address</p>
                
                <p>The verification code will expire in</p>
                <h1 id="timer">15:00</h1>
                <div class="row">
                    <input type="number" id="singleDigitInput1">
                    <input type="number" id="singleDigitInput2">
                    <input type="number" id="singleDigitInput3">
                    <input type="number" id="singleDigitInput4">
                    <input type="number" id="singleDigitInput5">
                    <input type="number" id="singleDigitInput6">
                </div>
                

                <button class='verification-wrapper-button' type="button" id="verify">Verify</button>
                
                <p>
                    Didn't receive code? 
                    <a href="" id="request">Send again!</a>
                </p>
            </div>
        </div>
        <audio id="player" src='../../static/public/withoutdrum.mp3'></audio>
    </div>
        `
    }],
    ['game', {
        auth_required: true,
        url: [/game\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})/],
        html: `

     <div
        class="background container-fluid social-background"
        style="padding: 0"
      >
    <div class="game-container">

        <div class="game-wrapper">
            <div class="game-data-wrapper">
                
            <div class="game-player-data" id="player-one">
                <div class="player-image">
                     <img src="https://picsum.photos/seed/picsum/200/300" alt="Player 2">
                </div>
                <div class="player-description" id="player-one-details">
                    <span class="player-name">Player 1</span>
                </div>
            </div>
            <div class="game-points">
                <h1 id="game-points" class="skeleton">

                </h1>
            </div>
            <div class="game-player-data" id="player-two">
                <div class="player-image">
                     <img src="https://picsum.photos/seed/picsum/200/300" alt="Player 2">
                </div>
                <div class="player-description" id="player-two-details">
                    <span class="player-name">Player 2</span>
                </div>
            </div>

        </div>
           <div class="" id="canvas-wrapper">
        <div class="spectators-wrapper" id="spectators-wrapper">
        </div>
               <div class="canvas-wrapper">
                <canvas class="canvas-class" id="pongCanvas" width="1368" height="600"></canvas>
               </div>
           </div>
        </div>
    </div>
        </div>
            `
    }],
    ['error', {
        auth_required: false,
        url: ['/error/'],
        html: `
      <div class="background container-fluid social-background">
        <div class="error-container">
          <div>
            <h1 id="error-number">ERROR NUMBER 404</h1>
            <p id="error-message">error message</p>
            <pong-redirect href="/home/"><button>Back to main</button></pong-redirect>
          </div>
        </div>
      </div>
            `
    }],
    ['matchmaking', {
        auth_required: true,
        url: ['/matchmaking/'],
        html: `
              <div
        class="container-fluid position-relative matchmaking-wrapper"
        style="padding: 0"
      >
        <div class="matchmaking-container">
          <div class="matchmaking-text-wrapper">
            <h1 id="matchmaking text">FINDING A MATCH</h1>
            <button id="close-matchmaking">X</button>
          </div>
          <div><h1 id="matchmaking-timer">00:00</h1></div>
        </div>
      </div>
        `

    }],
    ['tournaments', {
        auth_required: true,
        url: ['/tournaments/'],
        html: `
      <div class="background social-background">
        <div class="tournament-container">
          <div class="tournament-header">
            <h1>Tournaments</h1>
          </div>
          <div class="tournament-data-container">
            <div class="tournament-wrapper" id="tournament-wrapper">
            </div>
          </div>
          <pong-redirect href="/create-tournament/" class="create-tournament-button">CREATE TOURNAMENT</pong-redirect>
          <div class="tooltip" id="tooltip"></div>
        </div>
      </div>
`
    }],
    ['create-tournament', {
        auth_required: true,
        url: ['/create-tournament/'],
        html: `
              <div
        class="background container-fluid social-background"
        style="padding: 0"
      >
        <div class="create-container">
          <div class="create-header">
            <h1>Create Tournament</h1>
          </div>
          <form id="create-form">
            <div class="create-group">
              <label for="tournament-name-input">Tournament Name :</label>
              <input
                type="text"
                id="tournament-name-input"
                name="name"
                required
              />
            </div>
            <div class="create-group">
              <label for="range-input" id="range-label">Player Count :</label>
              <div class="range-wrapper">
                <input
                  type="range"
                  id="range-input"
                  min="4"
                  max="16"
                  value="2"
                   name="max_participants"

                />
                <span id="range-value">4</span>
              </div>
            </div>
            <div class="button-wrapper">
              <button id="create-button">CREATE</button>
            </div>
          </form>
        </div>
      </div>
        `
    }],
    ['tournament', {
        auth_required: true,
        url: [/tournament\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})/],
        html: `
      <div
        class="background container-fluid social-background"
        style="padding: 0"
      >
        <div class="tournament-container">
          <div class="tournament-header-wrapper">
    <h1 id="tournament-header"></h1>
          </div>
          <div class="tournament-details-wrapper">
            <div class="tournament-data-wrapper">
              <div class="tournament-participants" id="tournament-participants">
              </div>
              <div class="joined-details">
                <div class="joined-wrapper">
                  <div class="joined-header">
                    <h1>NAME</h1>
                  </div>
                  <div class="joined-ready">(NOT READY)</div>
                </div>
                <hr />
                <div class="tournament-matchups" id="matchups">

                </div>
              </div>
            </div>
              <div class="tournament-buttons" id="button-wrapper">
            </div>
          </div>
        </div>
      </div>
        `

    }],
    ['offline-game', {
        auth_required: true,
        url: ['/play/'],
        html: `
      <div
        class="background container-fluid social-background"
        style="padding: 0"
      >
    <div class="game-container">

        <div class="game-wrapper">
            <div class="game-data-wrapper">

            <div class="game-player-data" id="player-one">
                <div class="player-image">
                     <img src="https://picsum.photos/seed/picsum/200/300" alt="Player 2">
                </div>
                <div class="player-description" id="player-one-details">
                    <span class="player-name">Player 1</span>
                </div>
            </div>
            <div class="game-points">
                <h1 id="game-points" class="skeleton">
                    0 - 0
                </h1>
            </div>
            <div class="game-player-data" id="player-two">
                <div class="player-image">
                     <img src="https://picsum.photos/seed/picsum/200/300" alt="Player 2">
                </div>
                <div class="player-description" id="player-two-details">
                    <span class="player-name">Player 2</span>
                </div>
            </div>

        </div>
           <div class="" id="canvas-wrapper">
        <div class="spectators-wrapper" id="spectators-wrapper">
        </div>
               <div class="canvas-wrapper">
                <canvas class="canvas-class" id="pongCanvas" width="1368" height="600"></canvas>
               </div>
           </div>
        </div>
    </div>
        </div>
        `
    }]
]);
const routeToFile = [
    [["/auth/login/"], 'login'],
    [["/auth/register/"], 'register'],
    [[/profile\/[A-Za-z]+/], 'profile'],
    [['/social/', '/social/\\w+/g'], 'social'],
    [['/home/'], 'home'],
    [['/verification/'], 'verification'],
    [[/game\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})/], 'game'],
    [['/matchmaking/'], 'matchmaking'],
    [['/tournaments/'], 'tournaments'],
    [['/create-tournament/'], 'create-tournament'],
    [[/tournament\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})/], 'tournament'],
    [['/play/'], 'offline-game'],
]
const requiredScripts = [
    '/static/components/Notification.js',
    '/static/scripts/Request.js',
    '/static/scripts/requests.js',
    '/static/components/Component.js',
    '/static/components/spinner.js',
    '/static/scripts/utils.js',
    '/static/scripts/inbox.js',
    '/static/scripts/Status.js',
]
const nonAuthScripts = [
    '/static/scripts/requests.js',
    '/static/components/Component.js',
    '/static/components/spinner.js',
    '/static/scripts/utils.js',
    ]
export function loadError(statusCode, title, message) {
    let content = document.getElementById('main');
    content.innerHTML = routes.get('error').html;
    history.pushState({}, '', '/error/');
    let errorNumber = document.getElementById('error-number');
    let errorMessage = document.getElementById('error-message');
    errorNumber.innerText = `${statusCode} ${title}`;
    errorMessage.innerText = message;
    App();
}

function handleStyles(value) {
    let style = document.getElementById('style');
    if (style)
        style.remove();
    let newStyle = document.createElement('link');
    newStyle.rel = 'stylesheet';
    newStyle.href = '/static/styles/' + value + '.css';
    newStyle.id = 'style';
    document.head.appendChild(newStyle);
}

function findRouteKey(pathName) {
    for (let [key, value] of routes) {
        for (let url of value.url) {
            if (url instanceof RegExp) {
                if (url.test(pathName)) {
                    return key;
                }

            } else if (pathName.includes(url))
                return key;
        }
    }
    return null;
}

function loadRequiredScripts() {
        let pathName = window.location.pathname;
    let value = findRouteKey(pathName);
    let route = routes.get(value);
    if (route.auth_required === false) {
        nonAuthScripts.forEach(script => {
            if (!document.getElementById(script)) {
                let newScript = document.createElement('script');
                newScript.src = script;
                newScript.id = script;
                newScript.type = 'module';
                document.body.appendChild(newScript);
            }
        });
        return;
    }
    requiredScripts.forEach(script => {
        if (!document.getElementById(script)) {
            let newScript = document.createElement('script');
            newScript.src = script;
            newScript.id = script;
            newScript.type = 'module';
            document.body.appendChild(newScript);
        }
    });
}

function findRouteFile(pathName) {
    const route = routeToFile.find(route => route[0].some(url => {
        if (url instanceof RegExp) {
            return url.test(pathName);
        } else {
            return pathName.includes(url);
        }
    }));
    return route ? route[1] : null;
}

export function loadPage(fileName) {
    let data = findRouteFile(fileName);
    if (!data) {
        console.error("No route found for", fileName);
        return;
    }
    const route = routes.get(data);
    let isMatch = false;
    if (Array.isArray(route.url)) {
        isMatch = route.url.some(url => {
            if (url instanceof RegExp) {
                return url.test(window.location.pathname);
            } else {
                return window.location.pathname.includes(url);
            }
        });
    } else if (route.url instanceof RegExp) {
        isMatch = route.url.test(window.location.pathname);
    } else {
        isMatch = window.location.pathname.includes(route.url);
    }
    let split = fileName.split('/').filter(Boolean);
    if (!isMatch) {
        if (split.length > 1)
            history.pushState({}, '', window.location.origin + `/${split[0]}/${split[1]}/`);
        else
            history.pushState({}, '', window.location.origin + route.url);

    }
    let content = document.getElementById('main');
    content.innerHTML = route.html
    if(currentScript && window[currentScript] && window[currentScript].destroy)
        window[currentScript].destroy();
    renderPage().catch(console.error);
    currentScript = data;

}

async function tryRefreshToken() {
    let refresh_token = getCookie('refresh_token');
    if (!refresh_token)
        return;
    try {

        let data = await request(`auth/token/refresh/`, {
            method: 'POST',
            body: JSON.stringify({
                refresh: refresh_token
            }),
        });
        setCookie('access_token', data.access, 1);
        return true;
    } catch (error) {
        notify('Please login again', 3, 'error')
        return false
    }
}

async function checkForAuth() {
    if (getCookie('access_token'))
        return;
    if (await tryRefreshToken() === true)
        return;
    const pathName = window.location.pathname;
    let value = findRouteKey(pathName);
    if (!value)
        return;
    const route = routes.get(value);
    if (route.auth_required === true)
        loadPage('/auth/login/');
    else {
        if (!localStorage.getItem('activeUserNickname')) {
            let profile = await getProfile();
            localStorage.setItem('activeUserNickname', profile.nickname);
        }
    }
}
function checkInboxRequired() {
    let nonRequiredPaths = ['/login/', '/register/', '/auth/verification/'];
    return !nonRequiredPaths.includes(window.location.pathname);

}
export function assignRouting() {
     const returnButton = `  <pong-redirect class="return-to-home" id="redirect-to-home" href="/home/"><h1>HOME</h1></pong-redirect>`
    if(!document.getElementById('redirect-to-home'))
        document.body.insertAdjacentHTML('beforebegin', returnButton);
    let elements = document.querySelectorAll("pong-redirect");
    for (let element of elements) {
        if (element.getAttribute(('listener')) === 'true')
            continue;
        element.addEventListener('click', function (event) {
            event.preventDefault();
            let fileName = element.getAttribute('href');
            history.pushState({to: fileName}, '', window.location.origin + fileName);
            loadPage(fileName);
        });
        element.setAttribute('listener', 'true');
    }
    if(checkInboxRequired())
        createInbox();

}

function loadSpecificScript() {
    let pathName = window.location.pathname;
    let value = findRouteKey(pathName);
    if (!value) {
        loadError(404, 'Page not found', 'The page you are looking for does not exist')
        return;
    }
    if (document.getElementById('script'))
        document.getElementById('script').remove();
    let script = document.createElement('script');
    script.src = '/static/scripts/' + value + '.js?ts=' + new Date().getTime();
    script.type = 'module';
    script.id = "script";
    document.body.appendChild(script);
    handleStyles(value)
}

async function assignLocalStorage() {
    if (!checkIfAuthRequired())
        return;
    let profile = await getProfile();
    localStorage.setItem('activeUserNickname', profile.nickname);
}

export function checkIfAuthRequired() {
    const pathName = window.location.pathname;
    let value = findRouteKey(pathName);
    if (!value)
        return false;
    const route = routes.get(value);
    return route.auth_required;
}

async function renderPage() {
    loadRequiredScripts()
    loadSpecificScript();
    await checkForAuth();
    assignRouting()
}

const App = async () => {
    await checkForAuth();
    loadSpecificScript();
    loadRequiredScripts();
    assignRouting()
    await assignLocalStorage();
}

window.addEventListener('popstate', (event) => {
        let pathName = window.location.pathname;
        loadPage(pathName);
    }
);

document.addEventListener('DOMContentLoaded', App);

