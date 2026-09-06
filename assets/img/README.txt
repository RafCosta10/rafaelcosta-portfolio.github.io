Drop project photos in here, then swap the matching <div class="photo-frame">
in index.html for an <img> tag, e.g.:

  <div class="photo-frame">Photo — the car on the Quackston course</div>

becomes:

  <div class="photo-frame">
    <img src="assets/img/rc-car.jpg" alt="The PiCar-X on the Quackston test course">
  </div>

Photos are cropped to fill the frame (object-fit: cover), so roughly a
4:3 photo works best for project cards. Any resolution above ~800px
wide is plenty for a screen or a printed PDF.
