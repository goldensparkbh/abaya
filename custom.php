<?php
session_start();
error_reporting(0);
include('config.php');
$active = 'custom';
$logo = 'img/';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom Abaya</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.10/css/all.css" integrity="sha384-+d0P83n9kaQMCwj8F4RJB66tzIwOKmrdb46+porD/OvrJ+37WqIM7UoBtwHO6Nlg" crossorigin="anonymous">
</head>
  <style>

  .color-btn { 
    padding: 10px 10px; 
    margin: 5px; 
    color: white; 
    border: none; 
    cursor: pointer; 
    opacity: 0.8; /* default */
    /* display:flex; */
    /* justify-content: center; */
  }
  .color-btn.active { 
    opacity: 1; 
    border: 2px solid #000; /* highlight selected */
  }
    .model-option { display: inline-block; margin: 10px; text-align: center; }
    .addons { margin: 10px 0; }
    #display-area img { max-width: 100%; height: auto; }
    .height-input { position: relative; display: inline-block; }
    .height-label {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(255,255,255,0.7);
      padding: 2px 5px;
      font-size: 12px;
    }
  </style>
</head>
<body>
<?php include('./inc/header.php') ;?> 

<div class="container"style="padding-bottom: 100px;">
  <div class="row mt-5">
    <!-- Left Column: Form -->
    <div class="col-md-6">
      <h2>Choose Abayas Color</h2>
      <div id="colors" class="mb-3">
        <button id="N" class="color-btn btn" style="background-color: #1C1C2D; color: #fff;">Navy Black</button>
        <button id="C" class="color-btn btn" style="background-color: #4B4B4B; color: #fff;">Charcoal Gray</button>
        <button id="G" class="color-btn btn" style="background-color: #3C4F3F; color: #fff;">Dark Olive Green</button>
        <button id="S" class="color-btn btn" style="background-color: #D4BFAA;">Sandy Beige</button>
      </div>

      <h2 class="mt-4">Fabrics Used For Abayas</h2>
      <select id="fabric" class="form-control">
        <option value="">Select Fabric</option>
        <option value="Crepe">Crepe</option>
        <option value="Silk">Silk</option>
        <option value="Linen">Linen</option>
        <option value="Cotton">Cotton</option>
        <option value="Chiffon">Chiffon</option>
        <option value="Satin">Satin</option>
        <option value="Nada">Nada</option>
      </select>

      <h2 class="mt-4">Abayas Models Style</h2>
      <div id="models" class="mb-3">
        <label class="model-option mr-3 d-inline-block text-center">
          <input type="radio" name="model" id="O" value="O">
          <br>
          <img src="default/open-abaya.jpg" alt="Open Abaya" width="100"><br>Open Abaya
        </label>
        <label class="model-option mr-3 d-inline-block text-center">
          <input type="radio" name="model" id="C" value="C">
          <br>
          <img src="default/blazer-style.jpg" alt="Cross-Over Abaya" width="100"><br>Cross-Over Abaya
        </label>
        <label class="model-option d-inline-block text-center">
          <input type="radio" name="model" id="B" value="B">
          <br>
          <img src="default/cross-over.jpg" alt="Blazer Style Abaya" width="100"><br>Blazer Style Abaya
        </label>
      </div>

      <h2 class="mt-4">Add-ons</h2>
      <div class="addons mb-3">
        <label><input type="checkbox" id="E" value="E"> Embroidery</label><br>
        <label><input type="checkbox" id="L" value="L"> Lace trim</label><br>
        <label><input type="checkbox" id="B_addon" value="B"> Belt</label>
      </div>

      <h2 class="mt-4">Height (in cm)</h2>
      <div class="form-group">
        <input type="number" id="height" class="form-control" placeholder="Enter your height">
      </div>

      <button onclick="generateImage()" class="btn btn-primary">Generate Abaya</button>
      <?php if (isset($_SESSION['user'])): ?>
        <button onclick="saveAbaya()" class="btn btn-success ml-2" id="saveBtn">Save Abaya</button>
      <?php else: ?>
        <a href="login.php"><button class="btn btn-dark" id="saveBtn">Login to Request</button></a>
      <?php endif; ?>

    </div>

    <!-- Right Column: Display -->
    <div class="col-md-6" id="display-area">
      <h2>Selected Abaya</h2>
      <div id="result">
        <p>No Abaya generated yet.</p>
      </div>
    </div>
  </div>
</div>

        <?php include('./inc/footer.php') ;?> 
<script>
let selectedColor = '';
let selectedModel = '';
let finalName = '';
let selectedFabric = '';
let heightValue = '';
const tailorId = 1; 

// Example: Hardcoded tailor ID, change dynamically if neede
document.getElementById('colors').addEventListener('click', function(e) {
  if (e.target.tagName === 'BUTTON') {
    // Remove "active" class from all color buttons
    document.querySelectorAll('#colors .color-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Add "active" class to the clicked button
    e.target.classList.add('active');

    selectedColor = e.target.id;
    console.log('Selected Color:', selectedColor);
  }
});

document.getElementById('models').addEventListener('change', function(e) {
  if (e.target.name === 'model') {
    selectedModel = e.target.id;
    console.log('Selected Model:', selectedModel);
  }
});

function generateImage() {
  // Collect fabric selection
  let selectedFabric = document.getElementById('fabric').value;
  
  // Collect add-ons
  let addons = [];
  if (document.getElementById('E').checked) addons.push('E');
  if (document.getElementById('L').checked) addons.push('L');
  if (document.getElementById('B_addon').checked) addons.push('B');

  let addonsStr = addons.join('-');

  // Collect height
  let heightValue = document.getElementById('height').value;

  if (!selectedColor || !selectedModel || !selectedFabric || !heightValue) {
    alert('Please select color, model, fabric and enter height.');
    return;
  }

  // Show loading spinner and text
  document.getElementById('result').innerHTML = `
    <div class="text-center">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="sr-only">Loading...</span>
      </div>
      <p class="mt-3">Loading Abaya Preview...</p>
    </div>
  `;

  // Wait 3 seconds, then generate the image
  setTimeout(function() {
    // Generate final file name
    let finalName = selectedColor + '-' + selectedModel;
    if (addons.length === 0) {
      finalName += '-N';
    } else {
      finalName += '-' + addonsStr;
    }
    finalName += '.png';

    let imagePath = 'default/' + finalName;

    // Display the image
    document.getElementById('result').innerHTML = `
      <div class="position-relative">
        <img src="${imagePath}" alt="Generated Abaya" class="img-fluid border rounded shadow">
        <div class="position-absolute top-0 start-0 p-2 bg-light text-dark rounded">
          Height: ${heightValue} cm
        </div>
      </div>
      <p class="mt-3"><strong>Fabric:</strong> ${selectedFabric}</p>
    `;
  }, 1200);
}

</script>
<script>
function saveAbaya() {
  let fabric = document.getElementById('fabric').value;
  let embroidery = document.getElementById('E').checked ? 'Embroidery' : null;
  let lace_trim = document.getElementById('L').checked ? 'Lace trim' : null;
  let b_addon = document.getElementById('B_addon').checked ? 'Belt' : null;
  let height = document.getElementById('height').value;

  const colorMap = {
    'N': 'Navy Black',
    'C': 'Charcoal Gray',
    'G': 'Dark Olive Green',
    'S': 'Sandy Beige'
  };
  const abayaColor = colorMap[selectedColor] || null;

  let imageName = selectedColor + '-' + selectedModel;
  if (!embroidery && !lace_trim && !b_addon) {
    imageName += '-N';
  } else {
    let parts = [];
    if (embroidery) parts.push('E');
    if (lace_trim) parts.push('L');
    if (b_addon) parts.push('B');
    imageName += '-' + parts.join('-');
  }
  imageName += '.png';

  if (!abayaColor || !fabric || !selectedModel || !height) {
    alert('Please make sure all required fields are selected.');
    return;
  }

  fetch('save_abaya.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      abaya_color: abayaColor,
      fabrics: fabric,
      image_name: imageName,
      embroidery: embroidery,
      lace_trim: lace_trim,
      b_addon: b_addon,
      height_cm: height,
      status: 1,
      fk_tailor: tailorId
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.href = 'orders.php';
    } else {
      alert('Failed to save Abaya.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while saving.');
  });
}
</script>

</body>
</html>
