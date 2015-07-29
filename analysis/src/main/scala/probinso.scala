import java.io.File
import scala.math.{abs, log10, pow, sqrt}
import com.cra.figaro.language.{Apply, Element, Constant}
import com.cra.figaro.library.atomic.continuous.{Normal, Uniform}
import com.github.tototoshi.csv.CSVReader
import com.cra.figaro.algorithm.factored.beliefpropagation.MPEBeliefPropagation


class transmitterModel(frequency: Double) {

  val xLat : Element[Double] = Uniform(-90.0, 90.0)
  val xLon : Element[Double] = Uniform(-180.0, 180.0)

  def assertEvidence(lat : Double, lon : Double, p : Double) {

    val sLat : Element[Double] = Constant(lat)
    val sLon : Element[Double] = Constant(lon)

    val _dist  : Element[Double] = Apply(xLat, xLon, sLat, sLon,
      (xLat: Double, xLon: Double, sLat : Double, sLon : Double) =>
      sqrt(pow(abs(xLat - sLat),2) + pow(abs(xLon - sLon),2))
      )

    val _power : Element[Double] = Apply(_dist,
      ((dist : Double) => + 20 * log10(frequency) + 100)
      )

    val power  : Element[Double] = Normal(_power, 5)

    power.addConstraint((d : Double) => pow(0.02, abs(p - d)))
  }

  def infer = {
     val algorithm = MPEBeliefPropagation(10)
     algorithm.start()
     val retLat = algorithm.mostLikelyValue(xLat)
     val retLon = algorithm.mostLikelyValue(xLon)
     algorithm.stop()
     (retLat, retLon)
  }
}

object probinso {

  def main(args: Array[String]) = {
    val reader = CSVReader.open(new File("tables.csv"))
    var transmitters : Map[String, transmitterModel] = Map()
    for (line <- reader.all()) {
      if (!(transmitters.contains(line(6).toString)))
        transmitters += (line(6) -> new transmitterModel(line(7).toDouble))

      transmitters(line(6)).assertEvidence(line(2).toDouble, line(3).toDouble,  line(8).toDouble)
    }

    for ((key, value) <- transmitters)
      println(value.infer)

    println()
    println("Yo Dog!")
  }
}
