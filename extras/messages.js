let messages = {
    login: `[LOGIN] - "Anıl Bey" kişisi siteye giriş yaptı.`,
    logout: `[LOGIN] - "Anıl Bey" kişisi siteye çıkış yaptı.`,
    fail: {
      admin_auth: `[SISTEM] - "/admin" sayfasına yetkisiz giriş yapılmaya çalışıldı.`,
      unauthorized_postpublish: `[SISTEM] - "/postyayinla" sayfasına yetkisiz giriş yapılmaya çalışıldı.`,
      unauthorized_postpage: `[SISTEM] - "/postlar" sayfasına yetkisiz giriş yapılmaya çalışıldı.`,
      unauthorized_postcomment: `[SISTEM] - "/postlar/:id/yorumlar" sayfasına yetkisiz giriş yapılmaya çalışıldı.`,
      unauthorized_postedit: `[SISTEM] - "/post/edit" sayfasına yetkisiz giriş yapılmaya çalışıldı.`,
      unauthorized_postdelete: `[SISTEM] - "/postkaldir" sayfasına yetkisiz giriş yapılmaya çalışıldı.`,
      unauthorized_linkadd: `[SISTEM] - "/link/ekle" sayfasına yetkisiz giriş yapılmaya çalışıldı.`,
      unauthorized_linklist: `[SISTEM] - "/link/liste" sayfasına yetkisiz giriş yapılmaya çalışıldı.`,
      invailed_link: `[LINK] - Link sistemi geçerli olmayan bir veri ile kullanıldı! {ayar}`,
      unauthorized_keygen: `[SISTEM] - "/api/keygen" sayfasına yetkisiz giriş yapılmaya çalışıldı.`,
      unauthorized_keylist: `[SISTEM] - "/api/keyliste" sayfasına yetkisiz giriş yapılmaya çalışıldı.`,
      unauthorized_key: `[API-SISTEM] - "/api/postveri" sistemi başarıyla tam yetkili olmayan bir anahtar ile kullanıldı! "{key}"`,
      invailed_key: `[API-SISTEM] - "/api/postveri" sistemine geçersiz api anahtarı ile giriş yapılmaya çalışıldı. "{key}"`,
      expired_key: `[API-SISTEM] - "/api/postveri" sistemine süresi bitmiş bir api anahtarı ile giriş yapılmaya çalışıldı. "{key}"`
    },
    post_archive: {
      archived: `[BLOG] - "{postId}" ID'sine sahip POST "Anıl Bey" tarafından Arşivlendi.`,
      unarchived: `[BLOG] - "{postId}" ID'sine sahip POST "Anıl Bey" tarafından Arşivden kaldırıldı.`
    },
    success: {
      post_published_archived: `[BLOG] - "{title}" yazıt başlığına sahip "{date2}" anahtarına sahip yazıt ARŞİVLENMİŞ bir şekilde başarıyla yayınlandı!`,
      post_published: `[BLOG] - "{title}" yazıt başlığına sahip "{date2}" anahtarına sahip yazıt başarıyla yayınlandı!`,
      post_comment_deleted: `[BLOG-POST] - "{id}" id'li posttan "{date} kodlu yorum kaldırıldı."`,
      post_comment_published: `[BLOG-POST] - "{id}" id'li post'a yorum yapıldı!`,
      post_edited: `[BLOG] - "{title}" Post Düzenlendi.`,
      post_deleted: `[BLOG] - "{postId}" Post Kaldırıldı`,
      link_added: `[LINK] - Link sistemine yeni link eklendi! {url1}`,
      link_deleted: `[LINK] - Link sisteminden "{ayar}" anahtarlı link kaldırıldı!`,
      api_key_create: `[API] - "{apiKey}" Anahtar Oluşturuldu.`,
      api_key_delete: `[API] - "{apiKey}" Anahtar Kaldırıldı.`,
      authorized_key_used: `[API-SISTEM] - "/api/postveri" sistemi başarıyla tam yetkili bir anahtar ile kullanıldı! "{key}"`,
      api_key_used: `[API-SISTEM] - "/api/link/:id" sistemi Başarıyla veri çekildi! API Key: "{key}"`
    },
    zeroai: {
      comment_badwords_found: `[BLOG-POST-ZEROAI] - "{id}" id'li post'a küfürlü yorum paylaşıldı. Ve ZeroBOT tarafından engellendi.`,
      badwords_protect_update: `[ZEROAI-SYSTEM-BOOT] - ZeroBOT Küfür koruma sistemi güncellendi. Ve aktif edildi!`
    },
    link_used_wrong: `[LINK] - Link sistemi hatalı kullanıldı.`,
    link_used: `[LINK] - Link sistemi kullanıldı! {ayar}`,
    routed_link: `[LINK] - Link sisteminde bir kişi yönlendirildi! [{ayar}]`,
    api_key_expired: `[API] - {apiKey} Anahtarının kullanım süresi sona erdi.`,
    boot: "Yelkenler açıldı başkan! Proje hazır"
}

module.exports = messages
