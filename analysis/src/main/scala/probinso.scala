import java.io.File

import scala.math.{abs, log10, pow, sqrt}

import com.cra.figaro.language.Apply
import com.cra.figaro.language.Element
import com.cra.figaro.library.atomic.continuous.Normal
import com.cra.figaro.library.atomic.continuous.Uniform

import com.github.tototoshi.csv.CSVReader


class transmitterModel(frequency: Double) {

  val xLat : Element[Double] = Uniform(-90.0, 90.0)
  val xLon : Element[Double] = Uniform(-180.0, 180.0)

  def assertEvidence(lat : Double, lon : Double, p : Double) {

    val _dist  : Element[Double] = Apply(xLat, xLon, sLat, sLon,
      (xLat: Double, xLon: Double, sLat : Double, sLon : Double) =>
      sqrt(pow(abs(xLat - sLat),2) + pow(abs(xLon - sLon),2))
      )

    val _power : Element[Double] = Apply(_dist,
      ((dist : Double) => + 20 * log10(frequency) + 100)
      )

    val power  : Element[Double] = Normal(_power, 5)

    power.addConstraint( (d : Double) => pow(0.02, abs(p - d)) )
  }

  def infer = {
     val algorithm = MPEBeliefPropagation(10)
     algorithm.start()
     retval = algorithm.mostLikelyValue(xLat, xLon)
     algorithm.stop()
     retval
  }
}

object probinso {

  def main(args: Array[String]) = {
    val reader = CSVReader.open(new File("tables.csv"))
    var transmitters : Map[String, transmitterModel] = Map()
    for (line <- reader.all()) {
      println(line)
      if (! transmitters.exists(_ == line(6)))
        transmitters += (line(6) -> new transmitterModel(line(7).toDouble))

      transmitters(line(6)).assertEvidence(line(2).toDouble, line(3).toDouble,  line(8).toDouble)
    }

    println(reader.all())
    println("Yo Dog!")
  }
}
