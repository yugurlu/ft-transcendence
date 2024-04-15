import {API_URL, BASE_URL,assignRouting} from "./spa.js";
import {notify} from "../components/Notification.js";
import BaseComponent from "../components/Component.js";
import {request} from "./Request.js";
import Spinner from "../components/spinner.js";
import {getSocket} from "./requests.js";
import {escapeHTML} from "./utils.js";
class ChatFriendsComponent extends  BaseComponent{
    constructor(state,parentElement = null) {
        super(state,parentElement);
        this.html = this.handleHTML()
    }
    handleHTML()
    {
        return `
              ${this.state.friends.map(friend => `
                <div class="user-wrapper">
                  <div class="user-pic-wrapper">
                    <img
                      src="${BASE_URL}${friend.profile_picture}"
                      alt=""
                    />
                  </div>
                  <div class="user-info-wrapper">
                    <div
                      class="d-flex align-items-center justify-content-center gap-2"
                    >
                      <h6>${friend.nickname.length <=0 ? friend.user.username: friend.nickname}</h6>
                      <div class="online-icon"></div>
                    </div>
                    <span>Active Now</span>
            </div>
            </div>
              `).join('')}
`
    }
    render() {
        super.render();
    }
    setState(newState)
    {
        this.state = {...this.state, ...newState};
        this.html = this.handleHTML();
        this.render();
    }
}
class SocialPostsComponent extends BaseComponent {
    constructor(state, parentElement = null) {
        super(state, parentElement);
        this.html = "";
    }
    handleHTML() {
        if(this.state.tweets === undefined)
            return "";
        let userId = this.state.userId;
    return`
    ${this.state.tweets.map(tweet => `
            <div class="post-container">
                  <div class="d-flex position-relative">
                    <pong-redirect class="post-info" href="/profile/${tweet.from_user.nickname}">
                      <div class="user-pic-wrapper">
                        <img
                            src="${BASE_URL}${tweet.from_user.profile_picture}"
                            alt=""
                        />
                      </div>
                      <div>
                        <h6>${tweet.from_user.nickname}</h6>
                        <span>${calculateDate(tweet.date)}</span>
                      </div>
                    </pong-redirect>
                    <div>
                      <img  src="/static/public/more.svg" alt="" style="width: 50px" />
                    </div>
                  </div>
                  <div>
                    <div class="post-text">
                      <p>
                        ${escapeHTML(tweet.content)}
                      </p>
                    </div>
                    ${tweet.image ? `
                    <div class="post-image">
                      <img  src="${BASE_URL}${tweet.image}" alt="There is a problem with the image" />
                    </div>
                    `: ''}
                  </div>
                  <div class="post-interaction">
                    <div class="like-button" data-tweet-id="${tweet.id}">
                      <img  src="/static/public/${tweet.liked_users.includes(userId) ? "liked" :"not-liked"}.svg" alt="" />
                    </div>
                    <button class="comment-button" data-tweet-id="${tweet.id}"">
                      <img  src="/static/public/chat-bubble.svg"  alt="" />
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
            `
    }
    setState(newState)
    {
        this.state = {...this.state, ...newState};
        this.html = this.handleHTML()
        this.render()
    }
}
class PostTweetFormComponent extends  BaseComponent
{
    constructor(state,parentElement = null) {
        super(state,parentElement);
        this.html = this.handleHTML();
    }
    handleHTML()
    {
        if(this.state.imageUrl === undefined)
            return '';
        return `
            <div class="uploaded-image">

                <button class="image-close-button" id="preview-close-button" type="button">
                    X
                </button>
            <img src=${this.state.imageUrl} alt=""  />
         </div>

        `
    }
 render() {
        if(this.state.imageUrl === undefined)
        {
            document.getElementById('image-preview')?.remove();
            return;
        }
        if(document.getElementById('image-preview'))
        {
            document.getElementById('image-preview').remove();
        }
     let div = document.createElement('div');
    div.innerHTML = this.html;
    this.parentElement.appendChild(div);
    div.id = 'image-preview';
    let previewCloseButton = document.getElementById('preview-close-button');
    if(previewCloseButton)
    {
        previewCloseButton.addEventListener('click', () => {
            postTweetFormComponent.setState({imageUrl: undefined});
        });
    }
}

    setState(newState)
    {
        this.state = {...this.state, ...newState};
        this.html = this.handleHTML();
        this.render();
    }

}
class SelectedPostComponent extends BaseComponent{
    constructor(state, parentElement = null)
    {
        super(state, parentElement);
        this.html = this.handleHTML();
    }
    handleHTML()
    {
        const {results} = this.state.tweet;
        const {tweet, comments} = results;
        const {userId} = this.state;
        return `
            <div class="selected-post">
              <div class="post-container">
                <div class="d-flex position-relative">
                  <div class="post-info">
                    <div class="user-pic-wrapper">
                      <img
                        src="https://picsum.photos/seed/picsum/200/300"
                        alt=""
                      />
                    </div>
                    <div>
                      <h6>TEST1</h6>
                      <span>${calculateDate(tweet.date)}</span>
                    </div>
                  </div>
                  <div>
                    <img src="/static/public/more.svg" alt="" style="width: 50px" />
                  </div>
                  <div id="comment-back-button" style="cursor: pointer">
                    <img src="/static/public/go-back.svg" alt="Load Failed" />
                  </div>
                </div>
                <div>
                  <div class="post-text">
                    <p>
                    ${escapeHTML(tweet.content)}
                    </p>
                  </div>
                  ${tweet.image ? 
            `<div class="post-image">
                    <img src="${BASE_URL}${tweet.image}" alt="There was a problem with the image" />
              </div>`: ''}
                </div>
                <div class="post-interaction">
                  <div class="like-button" data-tweet-id="${tweet.id}">
                    <img src="/static/public/${tweet.liked_users.includes(userId) ? "liked" :"not-liked"}.svg" alt="" />
                  </div>
                  <div>
                    <img src="/static/public/chat-bubble.svg" alt="" />
                  </div>
                  <form id="comment-send-form">
                    <input
                      type="text"
                      name=""
                      id="comment-input"
                      placeholder="WRITE A COMMENT..."
                    />
                  </form>
                </div>
                <div class="post-comments">
            ${comments.map(comment => `
          <div class="post-comment">
                <div class="user-pic-wrapper" style="height: 3rem">
                  <img
                    src="https://picsum.photos/seed/picsum/200/300"
                    alt=""
                  />
                </div>
                <div style="flex: 1">
                <div style="display: flex;justify-content: space-between">          
              <h6>${comment.from_user.nickname}</h6>
                <span>${calculateDate(comment.date)}</span>
</div>
                  <p>
                    ${escapeHTML(comment.content)}
                  </p>
                </div>
              </div>
        `).join('')}
        
                </div>
              </div>
            </div>
        `
    }
    setState(newState)
    {
        this.state = {...this.state, ...newState};
        this.html = this.handleHTML();
        this.render();
    }
    render()
    {
        super.render();
        let backButton = document.getElementById('comment-back-button');
        backButton.addEventListener('click', () => {

            history.pushState({}, '', '/social');
            renderAllPosts();
        });
    }
}
class ConversationComponent extends BaseComponent
{
    constructor(state, parentElement = null) {
        super(state, parentElement);
    }
    handleHtml()
    {
        return `
        ${
            this.state.messages.map(message => `
             ${message.user.id === this.state.senderId ? `
              <div class="sent-message-container">
                  <div class="message-data-wrapper">
                    <span class="sent-message-date">${calculateDate(message.created_date)}</span>
                    <span class="sent-message-name">${message.user.nickname}</span>
                </div>
                  <p>
                    ${escapeHTML(message.content)}
                  </p>
                </div>
                `: `
                <div class="received-message-container">
                  <div class="message-data-wrapper">
                  <span class="received-message-name">${message.user.nickname}</span>
                  <span class="received-message-date">${calculateDate(message.created_date)}</span>
                </div>
                  <p>
                    ${escapeHTML(message.content)}
                  </p>
                </div>
                `}
            `).join('')
        }
        `

    }
    render() {
        this.html = this.handleHtml();
        this.parentElement.innerHTML = this.html;
    }
    setState(newState) {
        this.state = {...this.state, ...newState};
        console.log("state",this.state)
        this.render();
    }
}
let parentElement = document.getElementById('posts-wrapper');
let socialPostsComponent = new SocialPostsComponent({}, parentElement);
let parentFormElement = document.getElementById('social-send-form');
let postTweetFormComponent = new PostTweetFormComponent({}, parentFormElement);
function   calculateDate(date)
    {
    let tweetDate = new Date(date);
    let currentDate = new Date();
    let differenceInSeconds = Math.floor((currentDate - tweetDate) / 1000);

    let minute = 60;
    let hour = minute * 60;
    let day = hour * 24;
    let week = day * 7;
    if (differenceInSeconds < minute) {
        return `${differenceInSeconds} seconds ago`;
    }
    else if (differenceInSeconds < hour) {
        return `${Math.floor(differenceInSeconds / minute)} minutes ago`;
    }
    else if (differenceInSeconds < day) {
        return `${Math.floor(differenceInSeconds / hour)} hours ago`;
        }
    else if (differenceInSeconds < week) {
        return `${Math.floor(differenceInSeconds / day)} days ago`;
    }
    else {
        return `${Math.floor(differenceInSeconds / week)} weeks ago`;
        }
    }

const fetchChatFriends = async () => {

    const endpoint = `${API_URL}/profile/friends`;
    try {
        let response = await request(endpoint, {
            method: 'GET',
        });
        let parentElement = document.getElementById('user-data-wrapper');
        let chatFriendsComponent = new ChatFriendsComponent({friends: response},parentElement);
        let input = document.getElementById('friend-search-input');
        input.addEventListener('keyup', async (event) => {
            let value = event.target.value;
               let filteredFriends = response.filter(friend => {
        let nameToCheck = friend.user.username;
        return nameToCheck.toLowerCase().includes(value.toLowerCase());
           });
            chatFriendsComponent.setState({friends: filteredFriends});
        });
        chatFriendsComponent.render();

    }
    catch (error) {
        console.error('Error:', error);
    }
}
const fetchSocialPosts = async () => {
 try{
      let response = await request(`${API_URL}/tweets`, {method: 'GET'})
        socialPostsComponent.setState({tweets: response.results.tweets});

 }
    catch(error)
        {
            console.error('Error:', error);
            notify('Error fetching social posts', 3, 'error');
        }

    }
async function submitTweet(event) {
     event.preventDefault();
        let inputValue = document.getElementById('social-text-input').value;
        let image = document.getElementById("image-add");
        let formData = new FormData();
        formData.append('content', inputValue);
        if(image.files.length > 0)
            formData.append('image', image.files[0]);
        try{
        let data = await request(`${API_URL}/post-tweet`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': '',
            }
        });
        notify('Tweet posted successfully', 3, 'success');
        let {tweet} = data;
        socialPostsComponent.setState({tweets: [tweet, ...socialPostsComponent.state.tweets]});
        }
        catch(error)
        {
            console.error('Error:', error);

        notify('Error posting tweet', 3, 'error');
        }
}
async function assignLikeButtons()
    {
        let likeButtons = document.getElementsByClassName('like-button');
        for(let button of likeButtons)
        {
            let tweetId = button.getAttribute('data-tweet-id');
            button.addEventListener('click', async () => {
                try{
                    let data = await request(`${API_URL}/like_tweet/${tweetId}`, {
                        method: 'PATCH',

                    });
                    console.log(data);
                    button.children[0].src = button.children[0].src.includes('not') ?  '/static/public/liked.svg' : '/static/public/not-liked.svg';
                }
                catch(error)
                {
                    console.error('Error:', error);
                    notify('Error liking tweet', 3, 'error');
                }
            });
        }
    }
async function assignEventListeners() {
    let form = document.getElementById('social-send-form');
    form.addEventListener('submit', submitTweet);
    let imageAdd = document.getElementById('image-add');
    imageAdd.addEventListener('change', (event) => {
        let file = event.target.files[0];
        let url = URL.createObjectURL(file);
        postTweetFormComponent.setState({imageUrl : url});
    });
    async function assignCommentButtons()
    {
        let commentButtons = document.getElementsByClassName('comment-button');
        for(let button of commentButtons)
        {
            let tweetId = button.getAttribute('data-tweet-id');
            button.addEventListener('click', async () => {
                history.pushState({}, '', `/social/tweet/${tweetId}`);
                await renderIndividualPost(tweetId);
            });
        }
    }

    await assignLikeButtons();
    await assignCommentButtons();
}
async function getProfile()
{
    try{
        let data = await request(`${API_URL}/profile`, {
            method: 'GET'
        });
        localStorage.setItem('activeUserId', data.id);
        localStorage.setItem('activeUserNickname', data.nickname);
        socialPostsComponent.setState({userId: data.id});
        let nickname = document.getElementById('username');
        nickname.innerText = data.nickname;
    }
    catch(error)
    {
        console.error('Error:', error);
        notify('Error fetching profile', 3, 'error');
    }
}
const renderIndividualPost = async (tweetId) => {
    let response = await request(`${API_URL}/get-tweet-and-comments/${tweetId}`, {
        method: 'GET',
    });

        let data = await request(`${API_URL}/profile`, {
            method: 'GET',
        });
    let parentElement = document.getElementById('social-container');
    let selectedPostComponent = new SelectedPostComponent({tweet: response,userId:data.id}, parentElement);
    selectedPostComponent.render();
    await assignLikeButtons();
    await fetchChatFriends()
    let form = document.getElementById('comment-send-form');
    form.addEventListener('submit', async (event) => {
    event.preventDefault();
    let inputValue = document.getElementById('comment-input').value;
        try {
            let data = await request(`${API_URL}/post-comment`, {
                method: 'POST',
                body: JSON.stringify({content: inputValue, tweet: tweetId})
            });
        notify('Comment posted successfully', 3, 'success');
        let newComments = [ data, ...selectedPostComponent.state.tweet.results.comments];
        selectedPostComponent.setState({tweet: {results: {tweet: selectedPostComponent.state.tweet.results.tweet, comments: newComments}}});
        }
        catch(error)
        {
            console.error('Error:', error);
            notify('Error posting comment', 3, 'error');
        }
    }
    );
}

async function getProfile2() {
    try {
        let data = await request(`${API_URL}/profile`, {
            method: 'GET'
        });
        return data.profile_picture;
    } catch (error) {
        console.error('Error:', error);
        notify('Error fetching profile', 3, 'error');
        return null;
    }
}
const renderAllPosts = async () => {
    let profile_picture_url = await getProfile2();
    let container =    document.getElementById('social-container');
    container.innerHTML = `
                  <div
              class="social-wrapper"
              id="social-wrapper"
            >
              <div class="d-flex flex-column gap-2">
                <div class="social-send-info">
                  <div class="user-pic-wrapper">
                    <img
                      src="${BASE_URL}${profile_picture_url}"
                     alt=""
                    />
                  </div>
                  <h6 id="username">Test12</h6>
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

    `
    socialPostsComponent.parentElement = document.getElementById('posts-wrapper');
    postTweetFormComponent.parentElement = document.getElementById('social-send-form');
    await Promise.all([fetchChatFriends(), fetchSocialPosts(), getProfile()]);
    await assignEventListeners();

}
async function handleAddFriend(element)
{
    const socket = getSocket();
    let nickname = element.children[1].children[0].innerText;
    let friendRequestButton = document.getElementById('options-add-friend');
    try{
        let spinner = new Spinner({isVisible:true,className:"options-spinner"},friendRequestButton);
        spinner.render();
        let activeUserNickname = localStorage.getItem('activeUserNickname');
        let body = {
            request_type: "friend",
            sender: activeUserNickname,
            receiver: nickname
        }
        socket.send(JSON.stringify(body));
        spinner.setState({isVisible: false});
        friendRequestButton.innerText = 'Add Friend'
        notify('Friend request sent', 3, 'success');

    }
    catch(error)
    {
        console.error('Error:', error);
        notify('Error adding friend', 3, 'error');
    }
}
function addContextListeners(element)
{
    let addFriendButton = document.getElementById('options-add-friend');
    let blockUserButton = document.getElementById('options-block-user');
    addFriendButton.addEventListener('click',() => handleAddFriend(element));

}
function handleRightClick(event,element) {
      event.preventDefault();
      let mouseX = event.clientX;
      let mouseY = event.clientY;
      let chatOptions = document.getElementById("chat-options");
      chatOptions.style.top = `${mouseY}px`;
      chatOptions.style.left = `${mouseX}px`;
      chatOptions.classList.add("chat-options-open");
      chatOptions.addEventListener("click", (event) => {
        event.stopPropagation();
      });

      function handleChatContext()
      {
          let redirect = document.getElementById('profile-redirect');
          redirect.setAttribute('href', `/profile/${element.children[1].children[0].innerText}`)
      }
      handleChatContext()
    addContextListeners(element)
      document.addEventListener(
        "click",
        function closeMenu(event) {
          chatOptions.classList.remove("chat-options-open");
          document.removeEventListener("click", closeMenu);
        },
        { once: true }
      );
}
async function connectToRoom(room,conversationComponent)
{
    const nickname = localStorage.getItem('activeUserNickname');
    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${room.id}/${nickname}`);
    let chatSendForm = document.getElementById('chat-send');
    let chatInput = document.getElementById('chat-input');
    chatSendForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let content = chatInput.value;
        if(content.length <= 0)
            return;
        socket.send(JSON.stringify({message: content}));
        chatInput.value = '';
    });
    socket.onmessage = (event) => {
        let data = JSON.parse(event.data);
        console.log(data)
        let message = {
        content: data.message,
        user: {nickname: data.user,id: data.id},
        created_date: new Date()
        }
        conversationComponent.setState({messages: [message,...conversationComponent.state.messages ]});
        console.log("state",conversationComponent.state)
    }
}
async function fetchRoomData(element) {
    let nickname = element.children[1].children[0].innerText;
    let wrapper = document.getElementById('conversation-wrapper');
    let activeUserInfoWrapper = document.getElementById('active-user-info');
    activeUserInfoWrapper.children[0].innerText = nickname;
    let spinner = new Spinner({isVisible:true},wrapper);
    spinner.render();
    try {
        let data = await  request(`${API_URL}/start-chat`, {
            method: 'POST',
            body: JSON.stringify({nickname: nickname})
        });
        let {room} = data;
        let conversationWrapper = document.getElementById('conversation-wrapper');
        conversationWrapper.classList.remove('no-chat-wrapper')
        let conversationComponent = new ConversationComponent(
        {
            messages: room.messages.toReversed(),
            senderId: parseInt(localStorage.getItem("activeUserId")),
            receiverId: room.second_user
            },
            conversationWrapper);
        spinner.setState({isVisible: false});
        conversationComponent.render();
        await connectToRoom(room,conversationComponent);
    }
    catch (err) {
        console.error('Error:', err);
        spinner.setState({isVisible: false});
        notify('Error starting chat', 3, 'error');
    }
}
function handleChatState() {

    let chatContainer = document.getElementById("chat-container");
  let socialWrapper = document.getElementById("social-container");
  let chatCloseButton = document.getElementById("chat-close-button");
  chatCloseButton.addEventListener("click", () => {
    chatContainer.classList.add("chat-transition");
    setTimeout(() => {
      chatContainer.classList.remove("chat-transition");
      socialWrapper.classList.add("social-wrapper-chat-closed");
    }, 1000);
    chatContainer.classList.add("chat-closed");
  });
  async function toggleChat() {
      await fetchRoomData(this);
      if (chatContainer.classList.contains("chat-closed")) {
      chatContainer.classList.add("chat-transition");
      setTimeout(() => {
        chatContainer.classList.remove("chat-transition");
        chatContainer.classList.remove("chat-closed");
      }, 1000);
      socialWrapper.classList.add("social-wrapper-open");
      socialWrapper.classList.remove("social-wrapper-chat-closed");
    }

  }
  let allUsers = document.getElementsByClassName("user-wrapper");
  for (let i = 0; i < allUsers.length; i++) {
    allUsers[i].addEventListener("click", toggleChat);
  }
}
function handleChatEvents() {
  let elements = document.getElementsByClassName("user-wrapper");
  for (let element of elements) {
    element.addEventListener("contextmenu",(event) => handleRightClick(event,element));
  }
}

const App = async () => {
    let regex = /\/tweet\/(\d+)/;
    let match = window.location.pathname.match(regex);
    if (match)
        await renderIndividualPost(match[1]);
    else
        await renderAllPosts();
    assignRouting();
    handleChatEvents();
    handleChatState();
    //I don't know if this make sense but, I added this to prevent the form from submitting when
    //there is no chat active
  document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (event) => event.preventDefault());
    })
}
App().catch(error => console.error('Error:', error));

window.addEventListener('popstate', async (event) => {
    if(window.location.pathname === '/social/')
        await renderAllPosts();
    else
    {
        let regex = /\/tweet\/(\d+)/;
        let match = window.location.pathname.match(regex);
        if (match) {
            await renderIndividualPost(match[1]);
        }
    }
});
