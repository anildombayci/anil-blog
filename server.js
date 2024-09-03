let express = require("express"),
  app = require("express")(),
  terminal = require("terminal.xr"),
  bodyParser = require("body-parser"),
  session = require("express-session"),
  db = require("database.xr"),
  xariona = new terminal({
    saveFile: false,
    autoAdapterLoader: false,
    design: {
      timeStyle: "<{time}> =",
      filename: "output",
      adapterDir: `./adapters`,
    },
  }),
  ayarlar = {
    port: 3000,
    spotifyToken: "",
  },
  path = require("path"),
  passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  helmet = require("helmet"),
  moment = require("moment-timezone"),
  axios = require("axios"),
  http = require("http"),
  socket = require("socket.io"),
  server = http.createServer(app),
  io = socket(server),
  messages = require("./extras/messages.js");
app.use(express.static("dist"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
// Express için session yapılandırması
app.use(
  session({
    secret: "1542", // Daha güvenli bir değer kullanın
    resave: false,
    saveUninitialized: false,
  })
);
moment.tz.setDefault("Europe/Istanbul");
moment.locale("tr");

const users = [{ id: 1, username: "admin", password: "anil1542" }];

// Passport'ın başlatılması ve oturum desteği eklenmesi
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  const user = users.find((user) => user.id === id);
  done(null, user);
});

passport.use(
  new LocalStrategy(function (username, password, done) {
    const user = users.find(
      (user) => user.username === username && user.password === password
    );
    if (user) {
      return done(null, user);
    } else {
      return done(null, false, { message: "Kullanıcı adı veya şifre hatalı." });
    }
  })
);

//---------------------
let dir = path.resolve(`${process.cwd()}${path.sep}res`);
//---------------------

const yukle = (res, req, template, data = {}) => {
  const baseData = {
    path: req.path,
    user: req.isAuthenticated() ? req.user : null,
    db: require("database.xr"),
  };
  res.render(
    path.resolve(`${dir}${path.sep}${template}`),
    Object.assign(baseData, data)
  );
};

const checkAuth = (req, res) => {
  // Check if user is authenticated
  if (req.isAuthenticated()) {
    // Check if user has the required role (e.g., "admin")
    return req.user.username === "admin";
  } else {
    return false; // User is not authenticated
  }
};

const hh = (txt) => {
  let veri = db.get("moves"); // veri dizisini al
  const yeniHareket = txt; // Yeni hareket metnini oluştur, örneğin burada sabit bir metin kullanıyorum

  // Eğer veri dizisinin uzunluğu 10 veya daha fazlaysa, en eski hareketi kaldır
  if (Object.keys(veri).length >= 12) {
    veri.shift(); // En eski hareketi kaldır
  }

  // Yeni hareketi eklemek için dizinin sonuna ekle
  veri.push({
    text: yeniHareket,
    tarih: new Date().toLocaleString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }),
  });

  // Güncellenmiş veriyi veritabanına kaydet
  db.set("moves", veri);
  xariona.create(yeniHareket, { type: "info" });

  // Düzenlenmiş veriyi geri döndür
  return veri;
};

app.get("/", async function (req, res) {
  yukle(res, req, "index.ejs");
});

app.get("/portfolio", (req, res) => {
  yukle(res, req, "portfolio.ejs");
});

app.get("/dino", (req, res) => {
  yukle(res, req, "dino.ejs");
});

app.get("/test", (req, res) => {
  hh("/test domain sayfasına girildi.");
  yukle(res, req, "test.ejs");
});

app.post("/test", (req, res) => {
  /*
  if (yorumK(req.body.test)) {
    res.send("küfür var")    
  } else {
    res.send("küfür yok")
  }
  */
});

//-----------{Notification}---------------------

app.get("/notifications", (req, res) => {
  res.json({ count: 2 });
});
//-----------{Notification}---------------------
app.get("/login", (req, res) => {
  yukle(res, req, "login.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function (req, res) {
    hh(messages.login), res.redirect("/");
  }
);

app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    hh(messages.logout);
    res.redirect("/");
  });
});

app.get("/admin", async function (req, res, next) {
  if (checkAuth(req, res)) {
    // Use checkAuth function
    yukle(res, req, "admin.ejs");
  } else {
    // Handle unauthorized access (e.g., redirect to login)
    hh(messages.fail.admin_auth);
    res.status(403).send("Insufficient permissions."); // Or redirect to login page
  }
});

app.get("/admin/sht", async function (req, res) {
  db.set("moves", []);
  res.status(200).send(true);
});

//---------------------------------------[BLOG Başlangıç]-----------------------------------------------

// POST request for archiving a post
app.post("/postarchive", (req, res) => {
  const postId = req.body.postId;
  if (db.get(`post.${postId}.archived`) === true) {
    db.set(`post.${postId}.archived`, false);
    res.status(200).send("Arşivden kaldırıldı");
    hh(messages.post_archive.unarchived.replace("{postId}", postId));
  } else if (db.get(`post.${postId}.archived`) === false) {
    db.set(`post.${postId}.archived`, true);
    res.status(200).send("Arşivlendi");
    hh(messages.post_archive.archived.replace("{postId}", postId));
  }
});

app.get("/postyayinla", async function (req, res) {
  if (checkAuth(req, res)) {
    // Use checkAuth function
    yukle(res, req, "admin-postyayinla.ejs");
  } else {
    // Handle unauthorized access (e.g., redirect to login)
    hh(messages.unauthorized_postpublish);
    res.status(401).send("Insufficient permissions."); // Or redirect to login page
  }
});

app.post("/postyayinla", async function (req, res) {
  let ayar = req.body,
    title = ayar["baslik"],
    aciklama = ayar["aciklama"],
    date = new Date().toLocaleDateString(),
    author = "Anıl Dombaycı",
    date2 = Date.now(),
    sarki_id = ayar["selectedTrackId"],
    sarki_isim = ayar["selectedTrackName"],
    sarki_sanatcilar = ayar["selectedTrackArtists"],
    sarki_prev = ayar["selectedTrackPrev"],
    archived = ayar["archived"] ? true : false;

  console.log(req.body);
  if (!title && !aciklama)
    return res.status(400).send("Başlık ve açıklama gerekli.");
  if (!sarki_id || !sarki_isim || !sarki_sanatcilar || !sarki_prev) {
    db.set("post." + date2, {
      title: title,
      desc: aciklama,
      date: date,
      author: author,
      edited: false,
      likes: 0,
      archived: archived,
    });
  } else {
    db.set("post." + date2, {
      title: title,
      desc: aciklama,
      date: date,
      author: author,
      edited: false,
      likes: 0,
      spotify: {
        isim: sarki_isim,
        id: sarki_id,
        sanatcilar: sarki_sanatcilar,
        prev: sarki_prev,
      },
      archived: archived,
    });
  }
  if (archived === true) {
    hh(
      messages.success.post_published_archived
        .replace("{title}", title)
        .replace("{date2}", date2)
    );
  } else {
    hh(
      messages.success.post_published
        .replace("{title}", title)
        .replace("{date2}", date2)
    );
  }
  xariona.success(
    `"${title}" başlığında yeni bir post paylaşıldı! ${xariona.tick}`
  );
  res.status(200).redirect("/postlar");
});

app.get("/postlar", async function (req, res) {
  if (checkAuth(req, res)) {
    yukle(res, req, "admin-postlar.ejs");
  } else {
    hh(messages.fail.unauthorized_postpage);
    res.status(401).send("Insufficient permissions.");
  }
});

app.get("/postlar/:id/yorumlar", async function (req, res) {
  if (checkAuth(req, res)) {
    let id = req.params.id;
    yukle(res, req, "admin-yorumlar.ejs", { id: id });
  } else {
    hh(messages.fail.unauthorized_postcomment);
    res.status(401).send("Insufficient permissions.");
  }
});

app.post("/postlar/:id/yorumlar", async function (req, res) {
  let id = req.params.id;
  let veri = db.get(`post.${id}.comments`);
  let tarih = parseInt(req.body.date); // Tarih değerini sayıya çevirme
  let veri2;
  veri2 = veri.filter((x) => x.date !== tarih); // Tarihi sayıya çevirdik; // Filtrelenmiş veriyi konsola yazdırma
  db.set(`post.${id}.comments`, veri2);
  hh(
    messages.post_comment_deleted
      .replace("{id}", id)
      .replace("{date}", req.body.date)
  );
  res.status(200).send(true);
});

app.get("/post/:id", async function (req, res) {
  let id = req.params.id;
  let veri = db.get("post." + id);

  yukle(res, req, "post.ejs", { id: id, siteAdı: veri.title });
});

app.post("/post/:id", (req, res) => {
  let id = req.params.id;
  db.add(`post.${id}.likes`, 1);
  res.status(200).send(true);
});

function yorumK(y) {
  let küfürler = require("./extras/küfürler.json");
  let words = y.toLowerCase().split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    if (küfürler.includes(words[i])) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

app.post("/post/:id/comment", (req, res) => {
  let id = req.params.id;
  let ayar = req.body;
  if (ayar.name !== "Anıl" && yorumK(ayar.comment)) {
    res.send(
      "Yorumunuzda küfür tespit edilmiştir. Toplum kurallarına uyarak yorum paylaşmanızı şiddetle tavsiye ediyorum."
    );
    hh(messages.zeroai.comment_badwords_found.replace("{id}", id));
    db.add("ek", +1);
    db.push(`post.${id}.comments`, {
      name: "ZBT",
      comment: `"${ayar.name}" tarafından paylaşılan kişinin kural dışı yorumu engellendi.`,
      date: Date.now(),
    });
  } else {
    db.push(`post.${id}.comments`, {
      name: ayar.name,
      comment: ayar.comment,
      date: Date.now(),
    });
    hh(messages.success.post_comment_published.replace("{id}", id));
    // Bildirim olayını yay
    io.emit("notification", {
      postId: id,
      name: ayar.name,
    });
    res.redirect(`/post/${id}`);
  }
});

app.get("/post/:id/edit", async function (req, res) {
  let id = req.params.id;
  if (checkAuth(req, res)) {
    yukle(res, req, "post-edit.ejs", { id });
  } else {
    hh(messages.fail.unauthorized_postedit);
    res.status(401).send("Insufficient permissions.");
  }
});

app.post("/post/:id/edit", async function (req, res) {
  let id = req.params.id;
  let veri = db.get("post." + id);

  db.set(
    "post." + id,
    {
      title: req.body.title,
      desc: req.body.desc,
      date: veri.date,
      author: req.body.author ? req.body.author : veri.author,
      edited: true,
      likes: veri.likes,
    },
    hh(messages.success.post_edited.replace("{title}", req.body.title))
  );
  res.status(200).redirect("/");
});

app.get("/postkaldir", async function (req, res) {
  if (checkAuth(req, res)) {
    yukle(res, req, "admin-postkaldir.ejs");
  } else {
    hh(messages.fail.unauthorized_postdelete);
    res.status(401).send("Insufficient permissions.");
  }
});

app.post("/postkaldir", async function (req, res) {
  let ayar = req.body;
  db.delete("post." + ayar["postId"]);
  hh(messages.success.post_deleted.replace("{postId}", ayar.postId));
  res.status(200).redirect("/postlar");
});

app.get("/404", async function (req, res) {
  yukle(res, req, "404.ejs");
});

app.get("/v2", async function (req, res) {
  yukle(res, req, "spotify.ejs", { ayarlar });
});

app.post("/test", async function (req, res) {
  let ayar = req.body;
  console.log(ayar);
});

//-----------------------------[Blog Bitiş]--------------------------------
//-----------------------------[Notes Başlangıç]---------------------------

app.get("/notes", async function (req, res) {
  yukle(res, req, "notes.ejs");
});

//------------------------------[Notes Bitiş]------------------------------
//------------------------[Link Yönlendirme Başlangıç]---------------------

app.get("/link/ekle", async function (req, res) {
  if (checkAuth(req, res)) {
    yukle(res, req, "admin-linkekle.ejs");
  } else {
    hh(messages.fail.unauthorized_linkadd);
    res.status(401).send("Insufficient permissions.");
  }
});

app.post("/link/ekle", (req, res) => {
  var ayar = req.body.link;
  var url1 = generateApiKey();

  if (!ayar)
    return hh(messages.link_used_wrong).then(() =>
      res.status(404).send("Link girilmedi.")
    );
  else {
    db.set(`link.` + url1, {
      url: `https://anil-blog.glitch.me/link/${url1}`,
      href: ayar,
      date: Date.now(),
    });
    hh(messages.success.link_added.replace("{url1}", url1));
  }
});

app.get("/link/listele", (req, res) => {
  if (checkAuth(req, res)) {
    yukle(res, req, "admin-linkliste.ejs");
  } else {
    hh(messages.fail.unauthorized_linklist);
    res.status(401).send("Insufficient permissions.");
  }
});

app.post("/link/listele", (req, res) => {
  var ayar = req.body.link;
  if (!ayar) {
    hh(messages.link_used_wrong);
    res.status(404).send("Bu hatalı bir link anahtarıdır.");
  } else {
    db.delete("link." + ayar);
    hh(messages.success.link_deleted.replace("{ayar}", ayar));
  }
});
app.get("/link/:id", (req, res) => {
  let ayar = req.params.id; // Değiştirilen kısım
  let veri = db.get(`link.${ayar}`);
  if (veri) {
    hh(messages.link_used.replace("{ayar}", ayar));
    yukle(res, req, "yonlendirme.ejs", { link: veri.href, url: ayar });
  } else {
    hh(messages.fail.invailed_link.replace("{ayar}", ayar));
    res.status(404).send("Bu link geçerli değildir");
  }
});

app.post("/link/:id", (req, res) => {
  let ayar = req.params.id; // Değiştirilen kısım
  let veri = db.get(`link.${ayar}`);
  if (veri) {
    hh(messages.routed_link.replace("{ayar}", ayar));
    res.redirect(veri.href);
  } else {
    hh(messages.fail.invailed_link.replace("{ayar}", ayar));
    res.status(404).send("Bu link geçerli değildir");
  }
});

//------------------------[Link Yönlendirme Bitis]-------------------------
//-----------------------------[API Başlangıç]-----------------------------
app.get("/api", async function (req, res) {
  try {
    const apiKey = req.query.key; // Anahtarı query string'den alın

    // Anahtarın geçerliliğini kontrol et
    const isValidKey = checkApiKey(apiKey);
    console.log("isValidKey:", isValidKey); // Eklediğimiz log

    if (isValidKey.valid === false) {
      // Anahtar geçerli değilse 403 hatası gönderin (Yasak)
      res.status(403).send("Geçersiz API anahtarı.");
      return;
    }
    res.status(200).send("Anahtar Erişimi Var!");
  } catch (error) {
    // Hata durumunda istemciye hata mesajı gönderin
    console.error("API anahtarına erişim hatası:", error);
    res
      .status(500)
      .send("API anahtarına erişilemedi. Lütfen daha sonra tekrar deneyin.");
  }
});

app.get("/api/keygen", async function (req, res) {
  if (checkAuth(req, res)) {
    yukle(res, req, "admin-key.ejs");
  } else {
    hh(messages.fail.unauthorized_keygen);
    res.status(401).redirect("/404");
  }
});

// POST isteği için API anahtarı oluşturma endpoint'i
app.post("/api/keygen", async function (req, res) {
  try {
    // İstekten gelen verileri al
    // req.body.expiry değeri gün cinsinden olduğunu varsayalım
    let expiryDate = new Date(); // Şu anki tarihi al
    expiryDate.setDate(expiryDate.getDate() + parseInt(req.body.expiry)); // req.body.expiry kadar gün ekleyerek son kullanma tarihini ayarla

    let ayar = {
      owner: req.body.owner,
      expiry: req.body.expiry,
      gecerlilik: req.body.expiry === "unlimited" ? "unlimited" : expiryDate,
      yetki: req.body.yetki,
      dateISO: Date.now(),
      date: new Date().toLocaleString(),
    };

    // API anahtarı oluşturma işlemi
    const apiKey = generateApiKey(); // generateApiKey fonksiyonu, anahtar oluşturma mantığını içerir

    // Anahtar oluşturulduktan sonra veritabanına kaydet
    db.set("key." + apiKey, {
      sahip: ayar.owner,
      bitis: ayar.expiry, // Bitiş süresini direkt olarak atıyoruz
      gecerlilik: ayar.gecerlilik,
      yetki: ayar.yetki,
      iso: ayar.dateISO,
      date: ayar.date,
      key: apiKey,
    });

    hh(messages.success.api_key_create.replace("{apiKey}", apiKey));
    // Anahtar başarıyla oluşturulduğunda istemciye yanıt gönder
    res.status(200).redirect("/api/keyliste");
  } catch (error) {
    // Hata durumunda istemciye hata mesajı gönder
    console.error("Anahtar oluşturma hatası:", error);
    res
      .status(500)
      .send("API anahtarı oluşturulamadı. Lütfen daha sonra tekrar deneyin.");
  }
});

// API anahtarı oluşturma mantığını içeren fonksiyon
function generateApiKey() {
  // API anahtarı oluşturmak için gereken mantık burada gerçekleştirilecek
  // Örneğin, Math.random() kullanarak rastgele bir dize oluşturulabilir
  return Math.random().toString(36).substr(2, 10);
}

function checkApiKey(apiKey) {
  var keyData = db.get("key." + apiKey);

  console.log("Check API Key for:", apiKey);
  console.log("Key Data:", keyData);

  if (keyData) {
    if (keyData.bitis !== "unlimited") {
      let currentTime = Date.now();
      let expiryTime;

      // Anahtarın oluşturulma tarihini al
      let creationTime = new Date(keyData.iso).getTime();

      // Anahtarın geçerlilik süresini belirle
      expiryTime = creationTime + keyData.bitis * 24 * 60 * 60 * 1000;

      console.log("Current Time:", currentTime);
      console.log("Expiry Time:", expiryTime);
      console.log("Key Permission:", keyData.yetki);

      // Geçerlilik süresini kontrol et
      if (currentTime > expiryTime) {
        // Anahtarın süresi dolmuşsa false döndür
        console.log("API Key invalid: Expired");
        hh(messages.api_key_expired.replace("{apiKey}", apiKey));
        return { valid: false, permission: null };
      }
    }

    // Anahtarın yetkisini döndür
    console.log("API Key valid.");
    return { valid: true, permission: keyData.yetki };
  } else {
    // Anahtar veri yapısında bulunmuyorsa veya hatalı ise null döndür
    console.log("API Key invalid: Not found");
    return { valid: false, permission: null };
  }
}
app.get("/api/keyliste", async (req, res) => {
  if (checkAuth(req, res)) {
    yukle(res, req, "admin-keyliste.ejs");
  } else {
    hh(messages.fail.unauthorized_keylist);
    res.status(401).redirect("/404");
  }
});

app.post("/api/keykaldir", async function (req, res) {
  let ayar = req.body;
  db.delete("key." + ayar["apiKey"]);
  hh(messages.success.api_key_delete.replace("{apiKey}", ayar.apiKey));
  res.status(200).redirect("/api/keyliste");
});

app.get("/api/postveri/:id", async (req, res) => {
  let key = req.query.key,
    id = req.params.id,
    veri = db.get("post." + id),
    yorumSayi =
      Object.keys(veri.comments).length > 0
        ? Object.keys(veri.comments).length
        : 0,
    apiData = checkApiKey(key);

  if (apiData.valid) {
    if (apiData.permission === "okuma") {
      if (veri) {
        res.status(200).json({
          baslik: veri.title,
          aciklama: veri.desc,
          tarih: veri.date,
          yazar: veri.author,
          yorumSayı: yorumSayi,
          yorumlar: "Yorumları görüntüleme izniniz bulunmamaktadır.",
        });
        hh(messages.fail.unauthorized_key.replace("{key}", key));
      } else {
        hh(messages.fail.invailed_key.replace("{key}", key));
        res.status(404).send("Böyle post kimliği bulunamadı");
      }
    } else if (apiData.permission === "admin") {
      if (veri) {
        res.status(200).json({
          baslik: veri.title,
          aciklama: veri.desc,
          tarih: veri.date,
          yazar: veri.author,
          yorumSayı: yorumSayi,
          yorumlar: Object.values(veri.comments),
        });
        hh(messages.success.authorized_key_used.replace("{key}", key));
      } else {
        hh(messages.fail.invailed_key.replace("{key}", key));
        res.status(404).send("Böyle post kimliği bulunamadı");
      }
    } else {
      hh(messages.fail.unauthorized_key.replace("{key}", key));
      res
        .status(401)
        .send(
          "API anahtarınızın bu girişime yetkisi yoktur lütfen sistem admininden gerekli yetkiye sahip bir api anahtarı alınız"
        );
    }
  } else {
    hh(messages.fail.expired_key.replace("{key}", key));
    res.status(203).redirect("/404");
  }
});

app.post("/api/postyayinla", async (req, res) => {
  let ayar = req.body,
    apiData = checkApiKey(req.query.key);

  if (apiData.valid) {
    if (apiData.permission === "yayinlama" || apiData.permission === "admin") {
      axios
        .post("/postyayinla", {
          baslik: ayar.baslik,
          aciklama: ayar.aciklama,
          date: ayar.date ? ayar.date : new Date().toLocaleDateString(),
          author: "Anıl Dombaycı",
          date2: Date.now(),
        })
        .then((response) => {
          return res.status(200).send(response.data);
        })
        .catch((e) => {
          return res.status(404).send(e);
        });
    } else
      res
        .status(401)
        .send(
          "API anahtarınızın bu girişime yetkisi yoktur lütfen sistem admininden gerekli yetkiye sahip bir api anahtarı alınız"
        );
  } else
    res.status(404).send("Api Anahtarı Hatalı veya böyle bir anahtar yok.");
});

app.get("/api/link/:id", async (req, res) => {
  let key = req.query.key,
    id = req.params.id,
    veri = db.get("link." + id),
    apiData = checkApiKey(key);

  if (apiData.valid) {
    if (apiData.permission === "okuma" || apiData.permission === "admin") {
      if (veri) {
        hh(messages.success.api_key_used.replace("{key}", key));
        res.status(200).json({
          yonlendirme: veri.href,
          url: veri.url,
          tarih: veri.date,
        });
      } else {
        hh(messages.fail.invailed_key.replace("{key}", key));
        res.status(404).send("Böyle post kimliği bulunamadı");
      }
    } else {
      hh(messages.fail.unauthorized_key.replace("{key}", key));
      res
        .status(401)
        .send(
          "API anahtarınızın bu girişime yetkisi yoktur lütfen sistem admininden gerekli yetkiye sahip bir api anahtarı alınız"
        );
    }
  } else {
    hh(messages.fail.expired_key.replace("{key}", key));
    res
      .status(203)
      .send(
        "API anahtarınızın süresi dolmuştur lütfen sistem admininden yeni bir API anahtarı alınız"
      );
  }
});

//-----------------------------[API bitis]-----------------------------------------]

app.listen(ayarlar.port, () => {
  xariona.info(messages.boot);
});
