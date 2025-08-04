    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const signUpMobile = document.getElementById('signUpMobile');
    const signInMobile = document.getElementById('signInMobile');
    const container = document.getElementById('container');

    signUpButton?.addEventListener('click', () => {
      container.classList.add("right-panel-active");
    });

    signInButton?.addEventListener('click', () => {
      container.classList.remove("right-panel-active");
    });

    signUpMobile?.addEventListener('click', () => {
      container.classList.add("right-panel-active");
    });

    signInMobile?.addEventListener('click', () => {
      container.classList.remove("right-panel-active");
    });