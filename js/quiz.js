
var form="<h3>{{title}}</h3> \
  <p>{{description}}</p> \
  <form> \
  <label for='name'>Your Name</label>\
  <input id='name' name='name' ><br/>\
  <label for='email'>Email</label>\
  <input id='email' name='email' >\
  {{{questions}}} \
  <input type='button' value='submit' class='submit' onclick='check()'/>\
  </form> \
  "
var quiz;

function check() {
  function get_right_answer(a) {
    for (i in a) {
      if (a[i].correct) {
        return a[i].answer;
        }
    }
    return false;
  }

  var correct=0;
  _.each(quiz.questions, function(d,i) {
    var an=$("input:radio[name=q"+i+"]:checked").val();
    var answer=get_right_answer(d.answers);
    $("#q"+i+" .answer").remove();
    var view={"answer":answer}
    if (an===answer) {
      view.status="correct";
      correct++;
      }
    else {
      view.status="wrong";
      }
    $("#q"+i).append(Mustache.render(
    "<div class='answer {{status}}'>{{answer}}</div>",view))
    })
    var name=$("input#name").val();
    var email=$("input#email").val();
    sd=JSON.stringify({"answered":$("form").serializeArray(),
      "quiz":quiz})
    gform(quiz.formkey,name,email,sd); // send to google forms
    updateCookie("name",name);
    updateCookie("email",email);
    updateCookie(document.location.hash,correct);
  }

function gform(fk,name,email,val) {
    gurl="https://docs.google.com/a/okfn.org/spreadsheet/formResponse?formkey="+ fk +"&ifq"
    data={"entry.0.single":name,"entry.1.single":val,
      "entry.2.single":email,
        "submit":"Submit","pageNumber":0,"backupCache":undefined}
    $.post(gurl,data,function(d) {
      });
    }

function getCookie (key) {
  var c=document.cookie.split('; ');
  for (i in c) {
    var kv=c[i].split("=");
    if (kv[0]===key) {
      return (kv[1]);
      }
    }
 return (undefined);
 };

function updateCookie(key, val) {
  document.cookie=key+'='+val;
  }

function render_mc_answer(q,id)  {
  q.aid=Math.floor(Math.random()*10000);
  q.id=id;
  var tmpl="<li><input type='radio' name='{{id}}' id='{{aid}}' value='{{answer}}'>\
    <label for='{{aid}}'>{{{answer}}}</label></li>";
  return Mustache.render(tmpl,q);
  }
  
function render_question(q,id) {
  var id="q"+id;
  var tmpl="<div class='question' id='{{id}}' >{{{question}}}\
        <ul> \
        {{{answers}}}\
        </ul> \
        </div>"

  var view={"question":q.question,
    "id":id};
  view.answers=_.map(_.shuffle(q.answers), function(x) {
  return render_mc_answer(x,id);}).join("\n")
  return Mustache.render(tmpl,view);  
  }


function doquiz() {
  var data=document.location.hash.substr(1);
  $.getJSON(data,function(d) {
    quiz=d;
    var view={"title":d.title,
      "description":d.description};
    view.questions=_.map(d.questions,render_question).join("\n");  
    
    $("#form").append(Mustache.render(form,view));
    _.each(["name","email"],function(d) {
      if (getCookie(d)) {
        $("input#"+d).val(getCookie(d));
        }});
    if (getCookie(document.location.hash)) {
      var view={"correct":getCookie(document.location.hash)}
      $("#form > p").append(Mustache.render(
        "<div class='correct'>You've already done this quiz and ansered \
        {{correct}} answers correctly</div>",view))
      }
    })
  }

$(document).ready(doquiz());  



