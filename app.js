// Chave da API pública do OpenTripMap
const API_KEY = "5ae2e3f221c38a28845f05b611a5d9b0";

// Função principal para obter localização
function getLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(showPlaces, showError);
  } else {
    alert("Geolocalização não suportada neste navegador.");
  }
}

// Função para exibir lugares turísticos
function showPlaces(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  console.log("Localização detectada:", lat, lon);

  // Inicializa o mapa
  const map = L.map('map').setView([lat, lon], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Busca lugares próximos
  fetch(`https://api.opentripmap.com/0.1/en/places/radius?radius=1000&lon=${lon}&lat=${lat}&apikey=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("places");
      list.innerHTML = "";

      data.features.forEach(place => {
        const xid = place.properties.xid;

        // Busca detalhes de cada lugar
        fetch(`https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${API_KEY}`)
          .then(res => res.json())
          .then(detail => {
            const name = detail.name || "Sem nome";
            const photo = detail.preview?.source || "";
            const lat = detail.point.lat;
            const lon = detail.point.lon;

            // Cria item na lista
            const li = document.createElement("li");
            li.innerHTML = `
              <strong>${name}</strong><br/>
              ${photo ? `<img src="${photo}" alt="${name}" style="width:100%;border-radius:8px;margin-top:0.5em;" />` : ""}
            `;
            list.appendChild(li);

            // Adiciona marcador no mapa
            L.marker([lat, lon]).addTo(map).bindPopup(name);
          })
          .catch(err => {
            console.error("Erro ao buscar detalhes:", err);
          });
      });
    })
    .catch(err => {
      console.error("Erro ao buscar lugares:", err);
      alert("Erro ao carregar lugares. Verifique a chave da API ou conexão.");
    });
}

// Função para lidar com erro de geolocalização
function showError(error) {
  alert("Erro ao obter localização: " + error.message);
}

// Registro do Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registrado com sucesso"))
    .catch(err => console.error("Erro ao registrar Service Worker:", err));
}
