import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { Page, Text, View, Document, StyleSheet, PDFViewer, PDFDownloadLink, Font, Image } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: '/fonts/Roboto-Regular.ttf',
    },
    {
      src: '/fonts/Roboto-Bold.ttf',
      fontWeight: 'bold',
    },
  ],
});

// Funkcja formatująca datę
const formatDate = (date) => {
  const months = [
    'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
  ];
  const d = new Date(date);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const calculateTaxBreakdown = (brutto, vatRate = 0.23) => {
  const netto = brutto / (1 + vatRate);
  const vat = brutto - netto;
  return {
    netto: Number(netto.toFixed(2)),
    vat: Number(vat.toFixed(2)),
    brutto: Number(brutto.toFixed(2))
  };
};

// Style dla dokumentu PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoSection: {
    width: '40%',
    alignItems: 'flex-start',
    marginLeft: 0,
  },
  logo: {
    width: 160,
    height: 54,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },
  dateSection: {
    width: '40%',
    textAlign: 'right',
    fontSize: 12,
  },
  clientInfo: {
    marginBottom: 20,
    fontSize: 12,
  },
  title: {
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #000',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCellIndex: {
    width: '5%',
    padding: 5,
    fontSize: 10,
    textAlign: 'center',
  },
  tableCellName: {
    width: '40%',
    padding: 5,
    fontSize: 10,
  },
  tableCellQuantity: {
    width: '10%',
    padding: 5,
    fontSize: 10,
    textAlign: 'center',
  },
  tableCellPrice: {
    width: '15%',
    padding: 5,
    fontSize: 10,
    textAlign: 'right',
  },
  total: {
    marginBottom: 5,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: 'bold',
  },
  finalTotal: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  notes: {
    marginTop: 30,
    fontSize: 12,
  },
  signatureSection: {
    marginTop: 20,
    borderTop: '1 solid #000',
    paddingTop: 10,
  },
  signatureText: {
    fontSize: 10,
  },
});

// Komponent dokumentu PDF
const KosztorysPDF = ({ data, notes, hidePrices, totalRepairCost }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Nagłówek z logo i datą */}
      <View style={styles.headerContainer}>
        <View style={styles.logoSection}>
          <Image src="/img/logo.png" style={styles.logo} />
          <Text style={styles.logoText}>SERWIS SAMOCHODOWY</Text>
          <Text style={styles.logoText}>Lublin ul. Kasprowicza 38</Text>
          <Text style={styles.logoText}>                 tel. 513 150 535</Text>
        </View>
        <View style={styles.dateSection}>
          <Text>Lublin, {formatDate(new Date())}</Text>
          <View style={[styles.clientInfo, { marginTop: 30, textAlign: 'right' }]}>
            {data.klient.imie && data.klient.imie.trim() !== '' && data.klient.nazwisko && data.klient.nazwisko.trim() !== '' && (
              <Text>Klient: {data.klient.imie} {data.klient.nazwisko}</Text>
            )}
            {data.pojazd.producent && data.pojazd.producent.trim() !== '' && data.pojazd.model && data.pojazd.model.trim() !== '' && (
              <Text>Pojazd: {data.pojazd.producent} {data.pojazd.model}</Text>
            )}
            {data.pojazd.nr_rejestracyjny && data.pojazd.nr_rejestracyjny.trim() !== '' && (
              <Text>Nr rejestracyjny: {data.pojazd.nr_rejestracyjny}</Text>
            )}
            {data.pojazd.vin && data.pojazd.vin.trim() !== '' && (
              <Text>VIN: {data.pojazd.vin}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Lista usług */}
      {data.uslugi.length > 0 && (
        <View>
          <Text style={styles.title}>USŁUGI</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCellIndex}>Lp.</Text>
              <Text style={styles.tableCellName}>Czynność</Text>
              {!hidePrices && (
                <>
                  <Text style={styles.tableCellQuantity}>Ilość</Text>
                  <Text style={styles.tableCellPrice}>Netto</Text>
                  <Text style={styles.tableCellPrice}>VAT</Text>
                  <Text style={styles.tableCellPrice}>Brutto</Text>
                </>
              )}
            </View>
            {data.uslugi.map((usluga, index) => {
              const taxBreakdown = calculateTaxBreakdown(usluga.total);
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCellIndex}>{index + 1}.</Text>
                  <Text style={styles.tableCellName}>{usluga.nazwa}</Text>
                  {!hidePrices && (
                    <>
                      <Text style={styles.tableCellQuantity}>{usluga.quantity}</Text>
                      <Text style={styles.tableCellPrice}>{taxBreakdown.netto.toFixed(2)} PLN</Text>
                      <Text style={styles.tableCellPrice}>{taxBreakdown.vat.toFixed(2)} PLN</Text>
                      <Text style={styles.tableCellPrice}>{taxBreakdown.brutto.toFixed(2)} PLN</Text>
                    </>
                  )}
                </View>
              );
            })}
          </View>
          {!hidePrices && (
            <View style={styles.total}>
              <Text>
                Koszt robocizny (brutto):{' '}
                <View style={{
                  backgroundColor: 'rgba(213, 100, 26, 0.5)',
                  paddingHorizontal: 5,
                  borderRadius: 3
                }}>
                  <Text>{data.sumaUslugi.toFixed(2)} PLN</Text>
                </View>
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Lista materiałów */}
      {data.materialy.length > 0 && (
        <View>
          <Text style={styles.title}>MATERIAŁY</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCellIndex}>Lp.</Text>
              <Text style={styles.tableCellName}>Nazwa części</Text>
              {!hidePrices && (
                <>
                  <Text style={styles.tableCellQuantity}>Ilość</Text>
                  <Text style={styles.tableCellPrice}>Netto</Text>
                  <Text style={styles.tableCellPrice}>VAT</Text>
                  <Text style={styles.tableCellPrice}>Brutto</Text>
                </>
              )}
            </View>
            {data.materialy.map((material, index) => {
              const taxBreakdown = calculateTaxBreakdown(material.total);
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCellIndex}>{index + 1}.</Text>
                  <Text style={styles.tableCellName}>
                    {material.nazwa}
                    {material.nr_katalogowy && material.nr_katalogowy.trim() !== ''
                      ? ` - Nr kat: ${material.nr_katalogowy}`
                      : ''}
                  </Text>
                  {!hidePrices && (
                    <>
                      <Text style={styles.tableCellQuantity}>
                        {material.quantity}
                        {material.materialy?.jednostka && material.materialy.jednostka.trim() !== ''
                          ? material.materialy.jednostka
                          : ''}
                      </Text>
                      <Text style={styles.tableCellPrice}>{taxBreakdown.netto.toFixed(2)} PLN</Text>
                      <Text style={styles.tableCellPrice}>{taxBreakdown.vat.toFixed(2)} PLN</Text>
                      <Text style={styles.tableCellPrice}>{taxBreakdown.brutto.toFixed(2)} PLN</Text>
                    </>
                  )}
                </View>
              );
            })}
          </View>
          {!hidePrices && (
            <View style={styles.total}>
              <Text>Koszt części (brutto): {data.sumaMaterialy.toFixed(2)} PLN</Text>
            </View>
          )}
        </View>
      )}

      {/* Suma końcowa */}
      <View style={styles.finalTotal}>
        {hidePrices ? (
          <Text>Szacowany koszt naprawy: {totalRepairCost.toFixed(2)} PLN</Text>
        ) : (
          <Text>Łączny koszt naprawy (brutto): {(data.sumaUslugi + data.sumaMaterialy).toFixed(2)} PLN</Text>
        )}
      </View>

      {/* Uwagi */}
      {notes && notes.trim() !== '' && (
        <View style={styles.notes}>
          <Text style={styles.title}>INFORMACJE DLA KLIENTA:</Text>
          <Text>{notes}</Text>
        </View>
      )}

      {/* Sekcja podpisów */}
      {!hidePrices && (
  <View style={styles.signatureSection}>
    <Text style={[styles.signatureText, { width: '100%', marginBottom: 20 }]}>
      Przyjmuję raport o stanie pojazdu. Pojazd odebrałem/am sprawny oraz wolny od wad i usterek technicznych usuniętych wg powyższej specyfikacji.
    </Text>

    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      width: '100%'
    }}>
      <View style={{ width: '45%' }}>
        <Text style={styles.signatureText}>................................................................</Text>
        <Text style={styles.signatureText}>Pieczątka i podpis</Text>
      </View>

      <View style={{ width: '45%', alignItems: 'flex-end' }}>
        <Text style={styles.signatureText}>................................................................</Text>
        <Text style={styles.signatureText}>Data i podpis klienta</Text>
      </View>
    </View>
  </View>
)}
    </Page>
  </Document>
);

// Komponent do obsługi generowania PDF
export const PDFGenerator = ({
  klient,
  pojazd,
  addedServices,
  addedMaterials,
  calculateTotalPrice
}) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [showPDF, setShowPDF] = useState(false);
  const [hidePrices, setHidePrices] = useState(false);
  const [totalRepairCost, setTotalRepairCost] = useState(0);
  const [isPDFGenerated, setIsPDFGenerated] = useState(false);



  // Funkcja sprawdzającą czy dane klienta są kompletne
  const isClientDataComplete = () => {
    return (
      klient &&
      klient.imie && klient.imie.trim() !== '' &&
      klient.nazwisko && klient.nazwisko.trim() !== ''
    );
  };

  // Funkcja sprawdzającą czy dane pojazdu są kompletne
  const isVehicleDataComplete = () => {
    return (
      pojazd &&
      pojazd.producent && pojazd.producent.trim() !== '' &&
      pojazd.model && pojazd.model.trim() !== ''
    );
  };

  // Funkcja sprawdzającą czy wszystkie potrzebne dane są kompletne
  const isDataComplete = () => {
    return (
      isClientDataComplete() &&
      isVehicleDataComplete() &&
      (addedServices.length > 0 || addedMaterials.length > 0)
    );
  };

  const handleClose = () => {
    setOpen(false);
    setNotes('');
    setShowPDF(false);
    setHidePrices(false);
    setTotalRepairCost(0);
    setIsPDFGenerated(false);
  };

  const handleGenerate = () => {
    setShowPDF(true);
    setIsPDFGenerated(true);
  };

  const getFileName = () => {
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    const nrRej = pdfData.pojazd.nr_rejestracyjny;
    return `kosztorys_${nrRej}_${dateStr}.pdf`;
  };

  const pdfData = {
    klient,
    pojazd,
    uslugi: addedServices,
    materialy: addedMaterials,
    sumaUslugi: calculateTotalPrice(addedServices),
    sumaMaterialy: calculateTotalPrice(addedMaterials)
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        style={{ marginTop: 0, marginBottom: '10px' }}
        disabled={!isDataComplete()}
      >
        Generuj PDF
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Generowanie kosztorysu PDF</DialogTitle>
        <DialogContent>
          {!isPDFGenerated && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hidePrices}
                    onChange={(e) => setHidePrices(e.target.checked)}
                    color="primary"
                  />
                }
                label="Ukryj ceny szczegółowe"
              />

              {hidePrices && (
                <TextField
                  margin="dense"
                  label="Łączny koszt naprawy"
                  fullWidth
                  type="number"
                  value={totalRepairCost}
                  onChange={(e) => setTotalRepairCost(parseFloat(e.target.value) || 0)}
                />
              )}
            </>
          )}
        {!isPDFGenerated && (
          <TextField
            autoFocus
            margin="dense"
            label="Uwagi dla klienta (opcjonalne)"
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isPDFGenerated}
          />)}

          {showPDF && (
            <PDFViewer width="100%" height="500px" style={{ marginTop: '1rem' }}>
              <KosztorysPDF 
                data={pdfData} 
                notes={notes} 
                hidePrices={hidePrices} 
                totalRepairCost={totalRepairCost} 
              />
            </PDFViewer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Anuluj
          </Button>
          {!showPDF ? (
            <Button 
              onClick={handleGenerate} 
              color="primary" 
              disabled={hidePrices && (!totalRepairCost || totalRepairCost <= 0)}
            >
              Podgląd PDF
            </Button>
          ) : (
            <PDFDownloadLink
              document={
                <KosztorysPDF 
                  data={pdfData} 
                  notes={notes} 
                  hidePrices={hidePrices} 
                  totalRepairCost={totalRepairCost} 
                />
              }
              fileName={getFileName()}
            >
              {({ loading }) => (
                <Button 
                  color="primary" 
                  disabled={loading || (hidePrices && (!totalRepairCost || totalRepairCost <= 0))}
                >
                  {loading ? 'Generowanie...' : 'Pobierz PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};