function char_to_num(char) {
    return char.charCodeAt(0) % 10;
}



function calc_pw(n) {
  try {
    var pw_phrase = document.getElementById("pw_phrase");
    var keyword = document.getElementById("keyword"+n);
    var pw = document.getElementById("pw"+n);
    var strength = document.getElementById("strength");
    var hmacObj = new jsSHA(pw_phrase.value, "TEXT");
    pw.value = hmacObj.getHMAC(keyword.value, "TEXT", "SHA-512", "B64").substring(5,15);


      // now follow the weird additions to the passwords -- always adding a ! ... okay...

      // some fucking stupid ass services want "at least two numbers"
      // assholes.

      // need a rule matching system to make sure this generates
      // passwords that are "acceptable" to these fucking idiots.

      if (keyword.value == 'vanguard') {

          // 6-10 characters, need at least two numbers

          // mother fuckers!!!
          
          // turn the first two characters into numbers
          pw.value = char_to_num(pw.value[0]) + char_to_num(pw.value[1]) + pw.value.slice(2, pw.value.length);
      } else if (keyword.value == 'amex') {
          // Only the following special characters are allowed: %,&, _, ?, #, =, -

/*

Must be different from your User ID
Must contain 8 to 20 characters, including one letter and number
May include the following characters: %,&, _, ?, #, =, -
Your new password cannot have any spaces and will not be case sensitive.

*/

          pw.value = char_to_num(pw.value[0]) + char_to_num(pw.value[1]) + pw.value.slice(2, pw.value.length);
          pw.value = pw.value.replace(/\+/g,'_');


      } else if (keyword.value == 'bofa' || keyword.value == 'ing') {
          // no ! and shit, fuckers

          pw.value = char_to_num(pw.value[0]) + char_to_num(pw.value[1]) + pw.value.slice(2, pw.value.length);
          

      } else {

          if (pw.value.search('!') === -1) pw.value = pw.value + '!'
          if (pw.value.search(/[0-9]/) === -1) pw.value = pw.value + '0'

      }

  } catch(e) {
    pw.value = "ERROR: " + e;
  }
}
function pw_strength() {
    return;
    var pw_phrase = document.getElementById("pw_phrase");
    var score = zxcvbn(pw_phrase.value).score;
    if (score == '0') {strength.value = 'Very Weak'; strength.style.color = 'red'; }
    else if (score == '1') {strength.value = 'Weak'; strength.style.color = 'red'; }
    else if (score == '2') {strength.value = 'So so'; strength.style.color = 'orange'; }
    else if (score == '3') {strength.value = 'Okay'; strength.style.color = 'blue'; }
    else if (score == '4') {strength.value = 'Strong'; strength.style.color = 'green'; }
    else strength.value = '';
}
function check_pw2_same() {
  var pw_phrase = document.getElementById("pw_phrase");
  var pw_phrase2 = document.getElementById("pw_phrase2");
  var pw_same = document.getElementById("pw_same");
  if (pw_phrase.value === pw_phrase2.value)
    pw_same.value = 'Correct';
  else
    pw_same.value = 'Incorrect';
}
function clear_all() {
  document.getElementById("pw_phrase").value = '';
  document.getElementById("pw_phrase2").value = '';
  document.getElementById("strength").value = '';
  document.getElementById("pw_same").value = '';
  document.getElementById("keyword1").value = 'amazon';
  document.getElementById("keyword2").value = 'gmail';
  document.getElementById("keyword3").value = 'yahoo';
  document.getElementById("keyword4").value = 'foo';
  document.getElementById("keyword5").value = 'bar';
  document.getElementById("pw1").value = '';
  document.getElementById("pw2").value = '';
  document.getElementById("pw3").value = '';
  document.getElementById("pw4").value = '';
  document.getElementById("pw5").value = '';
}

setTimeout( function(){
document.getElementById('pw_phrase').addEventListener('keyup', pw_strength);
document.getElementById('pw_phrase2').addEventListener('keyup', check_pw2_same);
document.getElementById('keyword1').addEventListener('keyup', function(){calc_pw(1)});
document.getElementById('keyword2').addEventListener('keyup', function(){calc_pw(2)});
document.getElementById('keyword3').addEventListener('keyup', function(){calc_pw(3)});
document.getElementById('keyword4').addEventListener('keyup', function(){calc_pw(4)});
document.getElementById('keyword5').addEventListener('keyup', function(){calc_pw(5)});

for (var i=1; i<=5; i++) {
    document.getElementById('pw'+i).addEventListener('click', function(evt) {
        console.log('click on field',evt,this);
        this.focus();
        this.select();
    });
}

},300);

