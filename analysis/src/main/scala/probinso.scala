import java.io.File

import com.cra.figaro.language.Constant
import com.cra.figaro.language.Element

import com.cra.figaro.algorithm.learning.ExpectationMaximization

import com.cra.figaro.library.atomic.continuous.Normal

import com.github.tototoshi.csv.CSVReader

class selfLocationModel {

  // Location of Self
  val sLat : Element[Double] = Constant(0.0)
  val sLon : Element[Double] = Constant(0.0)
  val sRad : Element[Double] = Constant(0.0)

  val radSPosition : Element[Double] = Normal(sRad, 1) // should sigma be one?

  val latSPosition : Element[Double] = Normal(sLat, radSPosition)
  val lonSPosition : Element[Double] = Normal(sLon, radSPosition)

  def assertEvidence(Latitude : Double, Longitude : Double, Radius : Double) {
    sLat.observe(Latitude)
    sLon.observe(Longitude)
    sRad.observe(Radius)
  }
}

class transmitterRadiusModel(frequency: Double) {
  // Radial distance from trasmitter
  val tPow : Element[Double] = Constant(0.0)

  def powerToRadius(tPow : Element[Double]) = {
    val k : Double = 0.0
    k
  }

}

object probinso {

  def main(args: Array[String]) = {
    val reader = CSVReader.open(new File("tables.csv"))
    for (line <- reader.all()) println(line)
        

    println(reader.all())
    println("Yo Dog!")
  }
}
