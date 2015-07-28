import java.io.File

import com.cra.figaro.language.Constant
import com.cra.figaro.language.Element

import com.cra.figaro.library.atomic.continuous.Normal

import com.github.tototoshi.csv.CSVReader

class transmitterLocationModel {

  // Location of Self
  val sLat : Element[Double] = Constant(0.0)
  val sLon : Element[Double] = Constant(0.0)
  val sRad : Element[Double] = Constant(0.0)

  val radSPosition : Element[Double] = Normal(sRad, 1) // should sigma be one?

  val latSPosition : Element[Double] = Normal(sLat, radSPosition)
  val lonSPosition : Element[Double] = Normal(sLon, radSPosition)

  // Radial distance from trasmitter
  val tPow : Element[Double] = Constant(0.0)
  def powerToRadius(d : Element[Double]) = Constant(d.value * 10)

  val tRad : Element[Double] = powerToRadius(tPow)
}


object probinso {

  def assertEvidence(model: transmitterLocationModel,
      Latitude : Double, Longitude : Double, Radius : Double) {
    model.sLat.observe(Latitude)
    model.sLon.observe(Longitude)
    model.sRad.observe(Radius)
  }

  def main(args: Array[String]) = {
    val reader = CSVReader.open(new File("tables.csv"))

    println(reader.all())
    println("Yo Dog!")
  }
}
