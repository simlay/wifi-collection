import java.io.File
import com.github.tototoshi.csv.CSVReader
import math.{sqrt, pow, log10, abs}

import com.cra.figaro.library.compound.{If}
import com.cra.figaro.library.atomic.continuous.{Uniform, Normal, MultivariateNormal}
import com.cra.figaro.language.{Element, Constant, Apply}

import com.cra.figaro.algorithm.factored.beliefpropagation.MPEBeliefPropagation
import com.cra.figaro.algorithm.factored.beliefpropagation.BeliefPropagation

import com.cra.figaro.algorithm.sampling.MetropolisHastings
import com.cra.figaro.algorithm.sampling.ProposalScheme
import com.cra.figaro.algorithm.sampling.Importance



object simlay {

  class Transmitter(frequency:Double, initial_lat:Double, initial_lon:Double) {

    val latitude  : Element[Double] = Normal(initial_lat, 0.01)//Uniform(-90, 90)
    val longitude : Element[Double] = Normal(initial_lon, 0.01)//Uniform(-180, 180)


    def distance (x1:Double, y1:Double, x2:Double, y2:Double) = {
      sqrt(pow(x1 - x2, 2) + pow(y1 - y2, 2))
    }

    def assertSample(sample_lat:Double, sample_lon:Double, sample_power:Double) {
      val power = Apply(
        latitude, longitude,
        (x: Double, y: Double) =>
          20*log10(distance(sample_lon, x, sample_lat, y)) + 20*log10(frequency) + 10
      )

      val normalPower : Element[Double] = Normal(power, 10)

      normalPower.addConstraint((d : Double) => pow(0.02, abs(sample_power - d)))

    }
    def inferLocation = {
      val algorithm = MPEBeliefPropagation(1)
      algorithm.start()
      val most_likely_lat = algorithm.mostLikelyValue(latitude)
      val most_likely_lon = algorithm.mostLikelyValue(longitude)
      algorithm.stop()
      (most_likely_lat, most_likely_lon)
    }

    def inferLocationMH = {
      val algorithm = MetropolisHastings(20000, ProposalScheme.default, latitude, longitude)
      algorithm.start()
      val likely_latitude = algorithm.expectation(latitude, (i: Double) => i)

      val likely_longitude = algorithm.expectation(longitude, (i: Double) => i)
      algorithm.kill()
      (likely_latitude, likely_longitude)

    }

    def inferLocationImportance = {
      val importance = Importance(latitude)
      importance.start()
      Thread.sleep(1000)
      importance.stop()

      println(importance.distribution(latitude).toList) //Infer the probability that the painting is authentic.
    }
  }

  def main(args: Array[String]) = {
    println("BEGIN!")

    val reader = CSVReader.open(new File("tables.csv"))
    val lines = reader.all()
    val first_line = lines(0)
    val frequency = first_line(7).toDouble
    var lat = first_line(2).toDouble
    var lon = first_line(3).toDouble
    var power = 0.0
    println("Creating transmiter at " + lat + ", " + lon + ", freq: " + frequency)
    val transmitter = new Transmitter(frequency, lat, lon)

    for(line <- lines) {
      lat = line(2).toDouble
      lon = line(3).toDouble
      power = line(8).toDouble
      transmitter.assertSample(lat, lon, power)

    }
    // println(transmitter.inferLocation)
    println(transmitter.inferLocationMH)

  }
}
