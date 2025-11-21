$(document).ready(function () {
    const newPasswordInput = document.getElementById("newPasswordInput");
    const newRePasswordInput = document.getElementById("newRePasswordInput");
    const letter = document.getElementById("letter");
    const capital = document.getElementById("capital");
    const number = document.getElementById("number");
    const length = document.getElementById("length");
    function verifyRePassword() {
        if (newPasswordInput.value === newRePasswordInput.value) {
            document.getElementById("iguality").style.display = "block";
            document.getElementById("desiguality").style.display = "none";
        } else {
            document.getElementById("iguality").style.display = "none";
            document.getElementById("desiguality").style.display = "block";
        }
    }

    newPasswordInput.onfocus = function () {
        document.getElementById("message").style.display = "block";
    }
    newPasswordInput.onblur = function () {
        document.getElementById("message").style.display = "none";
    }

    newRePasswordInput.onfocus = function () {
        document.getElementById("messagePass").style.display = "block";
        verifyRePassword();
    }
    newRePasswordInput.onblur = function () {
        document.getElementById("messagePass").style.display = "none";
    }

    newRePasswordInput.onkeyup = function () {
        verifyRePassword();
    }

    newPasswordInput.onkeyup = function () {
        // Validate lowercase letters
        const lowerCaseLetters = /[a-z]/g;
        if (newPasswordInput.value.match(lowerCaseLetters)) {
            letter.classList.remove("invalid");
            letter.classList.add("valid");
        } else {
            letter.classList.remove("valid");
            letter.classList.add("invalid");
        }

        // Validate capital letters
        const upperCaseLetters = /[A-Z]/g;
        if (newPasswordInput.value.match(upperCaseLetters)) {
            capital.classList.remove("invalid");
            capital.classList.add("valid");
        } else {
            capital.classList.remove("valid");
            capital.classList.add("invalid");
        }

        // Validate numbers
        const numbers = /[0-9]/g;
        if (newPasswordInput.value.match(numbers)) {
            number.classList.remove("invalid");
            number.classList.add("valid");
        } else {
            number.classList.remove("valid");
            number.classList.add("invalid");
        }

        // Validate length
        if (newPasswordInput.value.length >= 8) {
            length.classList.remove("invalid");
            length.classList.add("valid");
        } else {
            length.classList.remove("valid");
            length.classList.add("invalid");
        }
    }
});