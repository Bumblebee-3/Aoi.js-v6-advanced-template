
const path = require("path")
const fs = require("fs")
function loadDash(client, panel, dash) {

  const app = panel.app;
  var bot = client;
  app.get("/", async (req, res) => {
    res.sendFile(__dirname + "/pages/index.html")
  })
  app.get("/dash", async (req, res) => {
    if (!req.session.act) {
      var link = dash.generateUrl()
      res.redirect(link)
    }
    else {
      res.redirect("/select")
    }
  })
  app.get("/redirect", async (req, res) => {
    let code = req.query.code;
    let ac = await dash.getAccessToken(code);
    req.session.act = ac
    res.redirect("/dash");
  })
  app.get("/logout", async (req, res) => {
    req.session.destroy(function(err) {
      if (err) {
        console.log(err);
      }// cannot access session here
      else {
        console.log("Logged Out")
      }
    })
    res.redirect("/");
  })

  app.get("/select", async (req, res) => {
    if (req.session.act) {
      let b = await dash.getCommonAdminGuilds(req.session.act);
      let d = await dash.getGuilds(req.session.act);
      let c = await dash.getAdminGuilds(req.session.act)
      for (let [i, guild] of Object.entries(d)) {
        var aa;
        var bb;
        if (c.includes(guild.id) == true && b.includes(guild.id) == true) {
          aa = aa + `<label style="margin-right: 20px;margin-bottom: 20px;"><li><div class="w3-card-4 w3-black w3-round-xxlarge w3-border-white w3-hover-border-indigo w3-topbar w3-bottombar w3-leftbar w3-rightbar">
<div class="w3-container w3-center"><br>
  <h3><pre style="color:#FFFFFF;">${guild.name}</pre></h3>
  <img src="https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png" alt="Server Icon" width="150px" height="150px" class="rounded-circle" onerror="this.src='https://www.freepnglogos.com/uploads/discord-logo-png/concours-discord-cartes-voeux-fortnite-france-6.png'" style="margin: 70px;border: 5px solid #ff0000;"  required><br><b><p style="color:white;text-align: center;">
  <a href="/dashboard/${guild.id}/"><button class="w3-button w3-green">Dashboard</button></a>
</div>
</div></li></label>`

        }
        else if (c.includes(guild.id) == true) {
          bb = bb + `<label style="margin-right: 20px;margin-bottom: 20px;"><li><div class="w3-card-4 w3-black w3-round-xxlarge w3-border-white w3-hover-border-indigo w3-topbar w3-bottombar w3-leftbar w3-rightbar">
<div class="w3-container w3-center"><br>
  <h3><pre style="color:#FFFFFF;">${guild.name}</pre></h3>
  <img src="https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png" alt="Server Icon" width="150px" height="150px" class="rounded-circle" onerror="this.src='https://www.freepnglogos.com/uploads/discord-logo-png/concours-discord-cartes-voeux-fortnite-france-6.png'" style="margin: 70px;border: 5px solid #ff0000;"  required><br><b><p style="color:white;text-align: center;">
  <a href="/invite-bot/${guild.id}/"><button class="w3-button w3-green">Invite!</button></a>
</div>
</div></li></label>`
        }



      };
      const a = path.join(__dirname, "/pages/guilds.html");
      const content = fs.readFileSync(a);
      const file = content.toString();
      res.send(file.replace("<!guilds>", aa.replace(/undefined/g, "")).replace("<!guildsA>", bb.replace(/undefined/g, "")))

    }
    else {
      let b = dash.generateUrl()
      res.redirect(b)
    }

  })
  app.get('/invite-bot/:id', function(request, response) {
    response.redirect(`https://discord.com/oauth2/authorize?response_type=code&client_id=${client.user.id}&scope=bot+applications.commands&guild_id=${request.params.id}&disable_guild_select=false&prompt=consent&permissions=8`);
  });
  app.get('/:id/setprefix', async (req, res) => {
    if (req.session.act) {
      let b = await dash.getCommonAdminGuilds(req.session.act);

      if (b.includes(req.params.id) == true) {
        let c = await client.db.set("main", "prefix", req.params.id, req.query.prefix);
        res.redirect(`/dashboard/${req.params.id}`)
      }
      else {
        res.send("Unauthorized!")
      }
    }
    else {
      let b = dash.generateUrl()
      res.redirect(b)
    }
  })
  
  app.get('/dashboard/:id', async (req, res) => {
    if (req.session.act) {
      let b = await dash.getCommonAdminGuilds(req.session.act);
      let d = await dash.getGuilds(req.session.act);

      if (b.includes(req.params.id) == true) {
        for (let [i, guild] of Object.entries(d)) {
          if (guild.id == req.params.id) {
            let gname = guild.name;
            let gicon = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
            let prefix = await bot.db.get("main", "prefix", req.params.id)
            res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<title>${gname}'s Dashboard</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">




<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
  <script src='https://kit.fontawesome.com/dc1278f4ea.js' crossorigin='anonymous'></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

  
<style>
body,h1,h2,h3,h4,h5,h6 {font-family: "Lato", sans-serif}
.w3-bar,h1,button {font-family: "Montserrat", sans-serif}
.fa-anchor,.fa-coffee {font-size:200px}

/* CUSTOM SCROLL BAR */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: darkgray; 
}
 
::-webkit-scrollbar-thumb {
  background: #555; 
}

::-webkit-scrollbar-thumb:hover {
  background: #888; 
}
  .grid {
  display: grid;
  gap: 1px;
  grid-template-columns: repeat(4, 1fr);
    display: flex;                       /* establish flex container */
  flex-wrap: wrap;                     /* enable flex items to wrap */
  justify-content: space-around;
}
</style>
<style>
  textarea::placeholder {
    color: #FFFFFF;  
  }
  input::placeholder {
    color: #FFFFFF;  
  }
  textarea {
    color: #FFFFFF;
    border:1px solid white;
  }
  input {
    color: #FFFFFF;
    border:1px solid white;
  }
</style>
</head>
<body>

<!-- Navbar -->
<div >
  <div class="w3-bar w3-theme w3-card w3-left-align w3-large">
    <a class="w3-bar-item w3-button w3-hide-medium w3-hide-large w3-right w3-padding-large w3-hover-white w3-large w3-theme" href="javascript:void(0);" onclick="myFunction()" title="Toggle Navigation Menu"><i class="fa fa-bars"></i></a>
    <a href="/" class="w3-bar-item w3-button w3-padding-large w3-white"><i class="fa-solid fa-house-chimney"></i> Home</a>
    
    <a href="https://aoi.js.org/invite" class="w3-bar-item w3-button w3-hide-small w3-padding-large w3-hover-white"><i class="fa-solid fa-user-doctor-message"></i><i class="fa-solid fa-hand"></i> Support Server</a>
  </div>

  <!-- Navbar on small screens -->

</div>


<!-- Header -->
<header class="w3-container w3-theme w3-center" style="padding:128px 16px">

  <h1 class="w3-margin w3-jumbo">${gname}'s Dashboard</h1>

</header>

<!-- First Grid -->
<div class="w3-row-padding w3-padding-64 w3-center w3-container w3-black"style="word-wrap: break-word;overflow:hidden;">
      <h1>Edit Prefix</h1><br>
      <div class="w3-container">
  <button onclick="document.getElementById('id01').style.display='block'" class="w3-button w3-green w3-large">Change Prefix</button>
  <div id="id01" class="w3-modal">
    <div class="w3-modal-content w3-black w3-card-4 w3-animate-zoom" style="max-width:600px">
      <div class="w3-center w3-black"><br>
        <span onclick="document.getElementById('id01').style.display='none'" class="w3-button w3-xlarge w3-hover-red w3-display-topright" title="Close Modal">&times;</span>
        <img src="${gicon}" alt="${gname}" style="width:30%" class="w3-circle w3-margin-top" onerror="this.src='https://www.freepnglogos.com/uploads/discord-logo-png/concours-discord-cartes-voeux-fortnite-france-6.png'">
      </div>
      <form class="w3-container" action="/${guild.id}/setprefix">
        <div class="w3-section">
          <label><b>Prefix</b></label>
          <input class="w3-input w3-black w3-border w3-margin-bottom" type="text" placeholder="${prefix.value}" name="prefix" required>
          <button class="w3-button w3-block w3-green w3-section w3-padding" type="submit">Change</button>
        </div>
      </form>
      <div class="w3-container w3-border-top w3-padding-16 w3-black">
        <button onclick="document.getElementById('id01').style.display='none'" type="button" class="w3-button w3-red">Cancel</button>
      </div>
    </div>
  </div>
</div>

</div>


<!-- Footer -->
<footer class="w3-container w3-padding-64 w3-center w3-theme" style="background-color:#3f51b5;">  
 
 <p><a href="https://github.com/AkaruiDevelopment" target="_blank">Copyright © 2022 Akarui Development Team.</a></p>
</footer>

<script>

// Used to toggle the menu on small screens when clicking on the menu button
function myFunction() {
  const x = document.getElementById("navDemo");
  if (x.className.indexOf("w3-show") === -1) {
    x.className += " w3-show";
  } else { 
    x.className = x.className.replace(" w3-show", "");
  }
}
</script>
<script>
function search() {
  // Declare variables
  let input, filter, ul, li, a, i, txtValue;
  input = document.getElementById('myInput');
  filter = input.value.toUpperCase();
  ul = document.getElementById("myUL");
  li = ul.getElementsByTagName('li');

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("pre")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}
</script>
</body>
  <script>
    async function theme(){
      await fetch('/themedata')
    .then((response) => response.json())
    .then((data) => {
      var colour=data.theme.toLowerCase();
		  var head = document.getElementsByTagName('head')[0];
		  var link = document.createElement('link');
		  link.rel = 'stylesheet';
		  link.type = 'text/css';
		  link.href = \`https://www.w3schools.com/lib/w3-theme-\${colour}.css\`;
      head.appendChild(link);
    });
      
    }
    theme()
  </script>
</html>

`)
          }
        }
      }
      else {
        res.send("Unauhorized!")
      }

    }
    else {
      let b = dash.generateUrl()
      res.redirect(b)
    }

  });





}


module.exports = {
  loadDash
}