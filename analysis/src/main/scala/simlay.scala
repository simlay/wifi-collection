import java.io.File
import com.github.tototoshi.csv.CSVReader
import math.{sqrt, pow, log10, abs}

import com.cra.figaro.library.compound.{If}
import com.cra.figaro.library.atomic.continuous.Normal
import com.cra.figaro.library.atomic.continuous.Uniform
import com.cra.figaro.library.atomic.continuous.MultivariateNormal
import com.cra.figaro.language.{Element, Constant, Apply}
import com.cra.figaro.algorithm.factored.VariableElimination
import com.cra.figaro.algorithm.factored.beliefpropagation.MPEBeliefPropagation



object simlay {

  class Transmitter(frequency:Double) {
    val latitude  : Element[Double] = Uniform(-90, 90)
    val longitude : Element[Double] = Uniform(-90, 90)


    def distance (x1:Double, y1:Double, x2:Double, y2:Double) = {
      sqrt(pow(x1 - x2, 2) + pow(y1 - y2, 2))
    }
    def assertSample(sample_lat:Double, sample_lon:Double, sample_power:Double) {
      def power = Apply(
        latitude, longitude,
        (x: Double, y: Double) =>
          20*log10(distance(sample_lon, x, sample_lat, y)) + 20*log10(frequency) + 100
      )

      val sPower : Element[Double] = Normal(power, 10)

      sPower.addConstraint( (d : Double) => pow(0.02, abs(sample_power - d)))

    }
  }


  val sLat : Element[Double] = Uniform(-90, 90)
  val sLon : Element[Double] = Uniform(-180, 180)



  def main(args: Array[String]) = {
    println("BEGIN!")

    val reader = CSVReader.open(new File("tables.csv"))
    val lines = reader.all()
    val transmitter = new Transmitter(2412.0)
    var lat = 0.0
    var lon = 0.0
    var power = 0.0

    for(line <- lines) {
      lat = line(2).toDouble
      lon = line(3).toDouble
      power = line(8).toDouble
      transmitter.assertSample(lat, lon, power)

      // println("lat: " + lat)
      // println("lon: " + lon)

      // sPower.observe(power)
    }
    val algorithm = MPEBeliefPropagation(10)
    algorithm.start()
    val most_likely_lat = algorithm.mostLikelyValue(transmitter.latitude)
    val most_likely_lon = algorithm.mostLikelyValue(transmitter.longitude)

    // println("Lat: " + xLat.value)
    // println("Lon: " + xLon.value)

  }
}
