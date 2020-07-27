var messages = document.getElementById("messages");
var textbox = document.getElementById("textbox");
var button = document.getElementById("button");
var done = document.getElementById("done");

$("#done").on("click", function(event) {
  var name = $("#name").val();
  console.log(name);

  button.addEventListener("click", function() {
    var newMessage = document.createElement("li");

    newMessage.innerHTML = name + ": " + textbox.value;
    messages.appendChild(newMessage);
    textbox.value = "";
  });
});

done.addEventListener("click", function() {
  document.getElementById("done").style.display = "none";
  document.getElementById("name").style.display = "none";
});
