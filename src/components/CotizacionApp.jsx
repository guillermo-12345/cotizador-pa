import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";

export default function CotizacionApp() {
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({ codigo: "", descripcion: "", cantidad: 0, precio: 0 });
  const [cliente, setCliente] = useState("");
  const [fecha, setFecha] = useState("");
  const [vendedor, setVendedor] = useState("");
  const [logistica, setLogistica] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto({ ...nuevoProducto, [name]: value });
  };

  const agregarProducto = () => {
    if (!nuevoProducto.codigo || !nuevoProducto.descripcion) return;
    setProductos([...productos, {
      ...nuevoProducto,
      cantidad: Number(nuevoProducto.cantidad),
      precio: Number(nuevoProducto.precio)
    }]);
    setNuevoProducto({ codigo: "", descripcion: "", cantidad: 0, precio: 0 });
  };

  const eliminarProducto = (index) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  const generarPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 40;
    const centerX = 300;

    const img = new Image();
    img.src = logo;
    doc.addImage(img, 'PNG', centerX - 50, 30, 100, 60);

    let currentY = 190;

    doc.setFontSize(11);
    doc.setTextColor(0);
    const fechaFormat = fecha ? new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
    const fechaFormat2 = fecha ? new Date(fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
    if (fechaFormat) {
      doc.text(`Ciudad de México, a ${fechaFormat}`, centerX, currentY, { align: "center" });
      currentY += 20;
    }

    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text(`COTIZACIÓN PARA ${cliente || 'Cliente'}`, centerX, currentY, { align: "center" });
    currentY += 30;

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text("Por medio del presente le enviamos saludos por parte del equipo de trabajo de PromoAlternative,", marginX, currentY);
    currentY += 14;
    doc.text("así mismo, le hacemos llegar la cotización solicitada:", marginX, currentY);
    currentY += 24;

    autoTable(doc, {
      startY: currentY,
      head: [["Código", "Descripción", "Cantidad", "Precio Unitario", "Total"]],
      body: productos.map(p => [
        p.codigo,
        p.descripcion,
        p.cantidad,
        `$${p.precio.toFixed(2)}`,
        `$${(p.cantidad * p.precio).toFixed(2)}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [33, 111, 183], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 6 },
    });

    const subtotal = productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0);
    const logisticaCosto = subtotal * (logistica / 100);
    const iva = (subtotal + logisticaCosto) * 0.16;
    const total = subtotal + logisticaCosto + iva;

    const summaryY = doc.lastAutoTable.finalY + 30;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 400, summaryY);
    if (logistica > 0) {
      doc.text(`Costo logístico (${logistica}%): $${logisticaCosto.toFixed(2)}`, 400, summaryY + 14);
    }
    doc.text(`IVA (16%): $${iva.toFixed(2)}`, 400, summaryY + (logistica > 0 ? 28 : 14));
    doc.text(`Total: $${total.toFixed(2)}`, 400, summaryY + (logistica > 0 ? 42 : 28));

    const condiciones = [
      "Forma de Pago: 50 % al confirmar y el resto previa entrega",
      "Tiempo de entrega: A partir de orden de compra y aprobación del diseño (render) en archivo 'AI'",
      "Entrega sin costo: Una sola entrega, en la CDMX",
      "Vigencia de la cotización: 8 días naturales",
      "Se necesita de una orden de compra para seguimiento al proyecto.",
      "En caso de modificar cantidad o diseño cotizado, cambia la cotización",
      "Si varía el dólar, se actualizará la cotización con el tipo de cambio del día",
      "El mal uso de logos/diseños sin autorización será responsabilidad del comprador",
      "Al recibir la mercancía conforme, se tienen 24h para notificar anomalías",
      "Mercancía sujeta a existencias"
    ];

    let y = summaryY + (logistica > 0 ? 100 : 86);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text("Condiciones Comerciales:", marginX, y);
    y += 18;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    condiciones.forEach(line => {
      doc.text(`- ${line}`, marginX, y);
      y += 14;
    });

    y += 40;
    doc.setFontSize(10);
    doc.text("Agradecemos su confianza y quedamos atentos a sus observaciones, para darle seguimiento a su proyecto.", marginX, y);
    y += 14;
    doc.text("Con el gusto de atenderlos como se merecen.", marginX, y);
    y += 28;
    doc.setFont(undefined, 'bold');
    if (vendedor) {
      doc.text(vendedor, marginX, y);
      y += 12;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text("Ejecutivo comercial", marginX, y);
    }

    y += 24;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("promoalternative.com | patycastro@promoalternative.com | Tel: 55 5097 5033 | Cel: 55 4340 1291", marginX, y);

    const fileName = `Cotizacion_${cliente || 'Cliente'}_${fechaFormat2 || 'Fecha'}.pdf`.replace(/\s+/g, '_');
    doc.save(fileName);
  };

  const subtotal = productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0);
  const logisticaCosto = subtotal * (logistica / 100);
  const iva = (subtotal + logisticaCosto) * 0.16;
  const total = subtotal + logisticaCosto + iva;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto bg-white shadow-xl rounded-xl space-y-4">
      <div className="flex justify-center mb-4">
        <img src={logo} alt="Logo" className="h-20" />
      </div>

      <h1 className="text-3xl font-bold text-blue-700 text-center">Cotización</h1>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="w-full md:w-1/2 border p-2 rounded text-center"
        />
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full md:w-1/4 border p-2 rounded text-center"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <input
          type="text"
          placeholder="Nombre del vendedor"
          value={vendedor}
          onChange={(e) => setVendedor(e.target.value)}
          className="w-full md:w-1/2 border p-2 rounded text-center"
        />
        <div className="relative w-full md:w-1/2">
          <input
            type="number"
            placeholder="Costo logístico"
            value={logistica === 0 ? "" : logistica}
            min={0}
            onChange={(e) => setLogistica(Number(e.target.value))}
            className="w-full border p-2 rounded text-center pr-6"
          />
          <span className="absolute right-3 top-2.5 text-gray-500">%</span>
        </div> 
        </div> 


      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4">
        <input type="text" name="codigo" value={nuevoProducto.codigo} onChange={handleChange} placeholder="Código" className="border p-2 rounded col-span-1" />
        <input type="text" name="descripcion" value={nuevoProducto.descripcion} onChange={handleChange} placeholder="Descripción" className="border p-2 rounded col-span-2" />
        <input type="number" name="cantidad" value={nuevoProducto.cantidad} onChange={handleChange} placeholder="Cantidad" className="border p-2 rounded col-span-1" />
        <input type="number" name="precio" value={nuevoProducto.precio} onChange={handleChange} placeholder="Precio" className="border p-2 rounded col-span-1" />
      </div>

      <button onClick={agregarProducto} className="w-full md:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
        Agregar Producto
      </button>

      <table className="w-full text-left border-t border-gray-300 text-sm md:text-base">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Código</th>
            <th className="p-2">Descripción</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Total</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{p.codigo}</td>
              <td className="p-2">{p.descripcion}</td>
              <td className="p-2">{p.cantidad}</td>
              <td className="p-2">${p.precio.toFixed(2)}</td>
              <td className="p-2">${(p.cantidad * p.precio).toFixed(2)}</td>
              <td className="p-2">
                <button onClick={() => eliminarProducto(idx)} className="text-red-500 hover:underline">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right space-y-1">
        <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
        <p><strong>Costo Logístico:</strong> ${logisticaCosto.toFixed(2)}</p>
        <p><strong>IVA:</strong> ${iva.toFixed(2)}</p>
        <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
      </div>

      <button
        onClick={generarPDF}
        className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
      >
        Descargar PDF
      </button>
    </div>
  );
}
