import java.io.File
import com.cra.figaro.language.Element
import com.cra.figaro.library.atomic.continuous.Normal
import com.github.tototoshi.csv.CSVReader
import scala.math.log10
import scala.math.pow
import scala.math.abs
import scala.math.sqrt
import com.cra.figaro.language.Constant
import com.cra.figaro.library.atomic.continuous.Uniform
import com.cra.figaro.language.Apply


class transmitterModel(frequency: Double) {

  val xLat, sLat : Element[Double] = Uniform(-90, 90)
  val xLon, sLon : Element[Double] = Uniform(-180, 180)

  val dist  : Element[Double] = Apply(xLat, xLon, sLat, sLon,
      (xLat: Double, xLon: Double, sLat : Double, sLon : Double) =>
      sqrt(pow(abs(xLat - sLat),2) + pow(abs(xLon - sLon),2))
      )



}

class transmitterLocationModel(Latitude : Double, Longitude : Double, 
    Radius : Double, Powers : List[Double]) {
  val self = new selfLocationModel
  self.assertEvidence(Latitude, Longitude, Radius)
  
}

object probinso {

  def main(args: Array[String]) = {
    val reader = CSVReader.open(new File("tables.csv"))
    for (line <- reader.all()) println(line)

    println(reader.all())
    println("Yo Dog!")
  }
}
