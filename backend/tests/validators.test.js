const { ventaSchema, ventaItemSchema, gastoSchema, vendedoraSchema, asistenciaSchema, pagoSchema } = require('../src/utils/validators');

describe('Validators - Schemas básicos', () => {
  test('ventaSchema acepta venta válida con items', () => {
    const data = {
      fecha: '2025-11-20',
      total: 1000.50,
      vendedora_id: 1,
      ticket_num: 'T001',
      items: [
        { descripcion: 'Prod A', cantidad: 2, precio_unitario: 250.25 },
        { descripcion: 'Prod B', cantidad: 1, precio_unitario: 500.00 }
      ]
    };
    const { error, value } = ventaSchema.validate(data);
    expect(error).toBeUndefined();
    expect(value.items.length).toBe(2);
  });

  test('ventaSchema rechaza venta sin items', () => {
    const data = { fecha: '2025-11-20', total: 100, vendedora_id: 1 };
    const { error } = ventaSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('ventaItemSchema valida item correcto', () => {
    const it = { descripcion: 'X', cantidad: 1, precio_unitario: 10 };
    const { error } = ventaItemSchema.validate(it);
    expect(error).toBeUndefined();
  });

  test('gastoSchema valida gasto correcto', () => {
    const g = { fecha: '2025-11-01', monto: 123.45, categoria: 'Transporte', periodo: '2025-11', creado_por: 1 };
    const { error } = gastoSchema.validate(g);
    expect(error).toBeUndefined();
  });

  test('vendedoraSchema rechaza nombre corto', () => {
    const v = { nombre: 'A', sueldo_base: 1000, porcentaje_comision: 5 };
    const { error } = vendedoraSchema.validate(v);
    expect(error).toBeDefined();
  });

  test('asistenciaSchema valida formato', () => {
    const a = { vendedora_id: 1, fecha: '2025-11-10', presente: true };
    const { error } = asistenciaSchema.validate(a);
    expect(error).toBeUndefined();
  });

  test('pagoSchema rechaza metodo inválido', () => {
    const p = { metodo_pago: 'cheque', monto: 100 };
    const { error } = pagoSchema.validate(p);
    expect(error).toBeDefined();
  });
});
