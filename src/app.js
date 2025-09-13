document.addEventListener('alpine:init', () => {
    Alpine.data('products', () => ({
        items: [
            { id: 1, name: '- Espresso -', img: 'expresso.jpg', price: 10000 },
            { id: 2, name: '- Latte -', img: '1.jpg', price: 20000 },
            { id: 3, name: '- Cappucino -', img: 'cappucinno.jpg', price: 20000 },
            { id: 4, name: '- Americano -', img: 'americano.jpg', price: 15000 },
            { id: 5, name: '- Matcha Latte -', img: 'macha.jpg', price: 15000 },
            { id: 6, name: '- Lemon Tea -', img: 'lemon tea.jpg', price: 12000 },


        ]
    }));

    Alpine.store('card', {
        items: [],
        total: 0,
        quantity: 0,
        add(newItem) {
            // cek apakah ada barang yang sama di cart
            const cartItem = this.items.find((item) => item.id === newItem.id);

            // jika belum ada masukkan barang
            if (!cartItem) {
                this.items.push({...newItem,quantity: 1, total: newItem.price });
                this.quantity++;
                this.total += newItem.price;
            } else {
                // jika baarang ada /cek apakah sama
                this.items = this.items.map((item) => {
                    // jika barang beda
                    if (item.id !== newItem.id) {
                        return item;
                    } else {
                        // jika barang ada 
                        item.quantity++;
                        item.total = item.price * item.quantity;
                        this.quantity++;
                        this.total += item.price;
                        return item;
                    }
                })
            }

        },
        remove(id){
            // remove berdasarkan id
            const cartItem = this.items.find((item) => item.id === id);
            // jika brg lebih dari satu maka bisa di remove
            if (cartItem.quantity > 1){
                this.items = this.items.map((item) => {
                    // jika bukan barang skip
                    if (item.id !== id) {
                        return item;
                    }else{
                        item.quantity--;
                        item.total =item.price * item.quantity;
                        this.quantity --;
                        this.total -= item.price;
                        return item
                    }
                })
            }else if (cartItem.quantity === 1) {
                // barang tinggal 1
                this.items = this.items.filter((item) => item.id !== id);
                this.quantity--;
                this.total-=cartItem.price

            }
        },
    });
});

const rupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}