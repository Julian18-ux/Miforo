
// Inicialización de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDsLGJh14YvBGmfu4UCOfvzqkyzAkRJQYI",
  authDomain: "foro-361fd.firebaseapp.com",
  databaseURL: "https://foro-361fd-default-rtdb.firebaseio.com",
  projectId: "foro-361fd",
  storageBucket: "foro-361fd.firebasestorage.app",
  messagingSenderId: "835951248899",
  appId: "1:835951248899:web:5803978981145501f93036",
  measurementId: "G-803MJSTVCY"
};

// Inicializamos Firebase
firebase.initializeApp(firebaseConfig);

const authDiv = document.getElementById('auth');
const forumDiv = document.getElementById('forum');
const loginForm = document.getElementById('login-form');
const postForm = document.getElementById('post-form');
const postsDiv = document.getElementById('posts');

// Autenticación
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    authDiv.classList.add('hidden');
    forumDiv.classList.remove('hidden');
    loadPosts();
  } else {
    authDiv.classList.remove('hidden');
    forumDiv.classList.add('hidden');
  }
});

// Iniciar sesión
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(error => alert(error.message));
});

// Registrarse
document.getElementById('register-btn').addEventListener('click', () => {
  const email = prompt("Introduce tu correo:");
  const password = prompt("Introduce una contraseña:");
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .catch(error => alert(error.message));
});

// Cerrar sesión
document.getElementById('logout-btn').addEventListener('click', () => {
  firebase.auth().signOut();
});

// Publicar
postForm.addEventListener('submit', e => {
  e.preventDefault();
  const content = document.getElementById('post-content').value;
  const file = document.getElementById('post-image').files[0];

  if (file) {
    // Subir imagen a Firebase Storage
    const storageRef = firebase.storage().ref(`images/${file.name}`);
    storageRef.put(file).then(snapshot => {
      snapshot.ref.getDownloadURL().then(url => {
        savePost(content, url);
      });
    });
  } else {
    savePost(content, null);
  }
});

// Guardar publicación en Realtime Database
function savePost(content, imageUrl) {
  firebase.database().ref('posts').push({
    content,
    imageUrl,
    author: firebase.auth().currentUser.email,
    timestamp: Date.now()
  });
  postForm.reset();
}

// Cargar publicaciones
function loadPosts() {
  firebase.database().ref('posts').on('value', snapshot => {
    postsDiv.innerHTML = '';
    snapshot.forEach(childSnapshot => {
      const post = childSnapshot.val();
      const postDiv = document.createElement('div');
      postDiv.innerHTML = `
        <p><strong>${post.author}</strong>:</p>
        <p>${post.content}</p>
        ${post.imageUrl ? `<img src="${post.imageUrl}" width="100%">` : ''}
        <hr>
      `;
      postsDiv.appendChild(postDiv);
    });
  });
}
