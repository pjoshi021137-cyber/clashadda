
function openRegister() {
    document.getElementById("register").scrollIntoView({
        behavior: "smooth"
    });
}

function joinTournament(name) {
    openRegister();

    const message = document.getElementById("message");

    message.textContent =
        "Selected Tournament: " + name +
        ". Complete the registration form below.";
}

document.getElementById("registerForm")
.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.getElementById("playerName").value;
    const email = document.getElementById("playerEmail").value;
    const uid = document.getElementById("gameUid").value;

    document.getElementById("message").textContent =
        "Demo registration received for " + name +
        ". Backend registration is not connected yet.";

    console.log({
        playerName: name,
        playerEmail: email,
        gameUID: uid
    });

    this.reset();
});
