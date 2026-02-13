class RoomCard extends HTMLElement {
  connectedCallback() {
    const roomNumber = this.getAttribute("room-number");
    const type = this.getAttribute("type");
    const capacity = this.getAttribute("capacity");
    const features = this.getAttribute("features") || "None";
    const roomId = this.getAttribute("room-id");

    this.innerHTML = `
      <div class="room-card">
        <h3>Room ${roomNumber}</h3>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Capacity:</strong> ${capacity} people</p>
        <p><strong>Features:</strong> ${features}</p>
        <button class="btn btn-primary" onclick="quickBook('${roomId}', '${roomNumber}')">
          Book This Room
        </button>
      </div>
    `;
  }
}

customElements.define("room-card", RoomCard);
