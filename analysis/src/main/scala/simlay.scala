import java.io.File
import com.github.tototoshi.csv.CSVReader
import math.{sqrt, pow, log10, abs, sin, Pi}

import com.cra.figaro.library.compound.{If}
import com.cra.figaro.library.atomic.continuous.{Uniform, Normal, MultivariateNormal}
import com.cra.figaro.language.{Element, Constant, Apply}

import com.cra.figaro.algorithm.factored.beliefpropagation.MPEBeliefPropagation
import com.cra.figaro.algorithm.factored.beliefpropagation.BeliefPropagation

import com.cra.figaro.algorithm.sampling.MetropolisHastings
import com.cra.figaro.algorithm.sampling.ProposalScheme
import com.cra.figaro.algorithm.sampling.Importance



object simlay {
  def deg2rad(deg:Double) = {
    deg * (Pi/180.0)
  }
  def getDistance(
    lat1: Double,
    lon1: Double,
    lat2: Double,
    lon2: Double
  ) = {
    var R = 6371;
    var dLat : Double = deg2rad(lat2-lat1);
    var dLon : Double = deg2rad(lon2-lon1);
    var a =
      sin(dLat / 2) * sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in meters
    // println(lat1 + "," + lon1 + "," + lat2 + "," + lon2 + ":" + (d*1000))
    d*1000; // For the meters
  }

  class Transmitter(frequency:Double, initial_lat:Double, initial_lon:Double) {

    val latitude  : Element[Double] = Uniform(-90, 90)// Normal(initial_lat, 1)
    val longitude : Element[Double] = Uniform(-180, 180) // Normal(initial_lon, 1)

    // val latitude  : Element[Double] = Normal(initial_lat, 1)
    // val longitude : Element[Double] = Normal(initial_lon, 1)


    def assertSample(sample_lat:Double, sample_lon:Double, sample_power:Double) {
      val power = Apply(
        latitude, longitude,
        (y: Double, x: Double) =>
          20*log10(getDistance(sample_lat, sample_lon, y, x)) + 20*log10(frequency) + 92
      )

      // val normalPower : Element[Double] = Uniform(Apply(power, (p:Double) => p - 10.0),Apply(power, (p:Double) => p + 10.0))
      //val normalPower : Element[Double] = Normal(power, 0.1)

      power.addConstraint((d : Double) => pow(0.2, abs(sample_power - d)))

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
      val algorithm = MetropolisHastings(2000000, ProposalScheme.default, latitude, longitude)
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
    println("Creating transmiter at " + lat + "," + lon + ", freq: " + frequency)
    val transmitter = new Transmitter(frequency, lat, lon)

    for(line <- lines) {
      lat = line(2).toDouble
      lon = line(3).toDouble
      power = line(8).toDouble
      transmitter.assertSample(lat, lon, power)

    }
    // println(transmitter.inferLocation)
    val infered_location = transmitter.inferLocationMH
    println(infered_location)
    println(getDistance(
      infered_location._1,
      infered_location._2,
      lat,
      lon
    ))

  }
}
