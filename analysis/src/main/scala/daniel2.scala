

import com.cra.figaro.language._
import com.cra.figaro.library.compound._
import com.cra.figaro.library.compound.DuoElement
import com.cra.figaro.algorithm.factored.beliefpropagation._
import com.cra.figaro.library.atomic.continuous._
import com.github.tototoshi.csv.CSVReader
import java.io.File

import com.cra.figaro.algorithm.sampling.MetropolisHastings
import com.cra.figaro.algorithm.sampling.ProposalScheme
import com.cra.figaro.algorithm.sampling.Importance


class Transmitter() {
  val latitude = Uniform(-180.0, 180.0)
  val longitude = Uniform(-90.0, 90.0)
}

class Receiver(lat: Double, long: Double, acc: Double, level: Double, frequency: Double, transm: Transmitter) {
  
  val k1 = 0.1 // TODO SET/OPTIMIZE K
  val latitude = Normal(Constant(lat), Constant(acc*k1))
  val longitude = Normal(Constant(long), Constant(acc*k1))
  
  //latitude.addConstraint( (d : Double) => d )
  //longitude.addConstraint( (d : Double) => d )
  
  val transmitter = transm
  
  val k2 = -20  
  val distance = Apply(latitude, longitude, transmitter.latitude, transmitter.longitude,
      (lat: Double, long: Double, tLat: Double, tLong: Double) =>
      Math.sqrt( (tLat - lat)*(tLat - lat) + (tLong - long)*(tLong - long) )
  )
  
  val freq = Constant(frequency)  
  val power = Apply(distance, freq,
      (dist: Double, freq: Double) => -10 + 20*Math.log10(dist) + 20*Math.log10(freq) + k2
      )
  
  val variance = 5.0   
  val expectedPower = Normal(power, Constant(variance))
  
  expectedPower.addConstraint( (d : Double) => Math.pow(0.02, Math.abs(level - d)) )
  
}



object GoodProgram {
  
  def main(args: Array[String]) = {
    println("Started.")
    val reader = CSVReader.open(new File("tables.csv"))
    println("Loaded data.")
    val data = reader.all()
    
    //var receivers : List[Receiver] = List()    
    val TRANSM = new Transmitter()
    
    for (line <- data) {
      println(line)
      var r = new Receiver(line(2).toDouble, line(3).toDouble, line(4).toDouble, line(8).toDouble, line(7).toDouble, TRANSM)
      //receivers = receivers ::: List(r)
    }

    println("Done setting up model!")
    //println(receivers.length)
  
    
    val algorithm = MetropolisHastings(200000, ProposalScheme.default, TRANSM.latitude, TRANSM.longitude) //Create an instance of the importance sampling algorithm. 1000 is the number of samples to use, while model.numberBuy indicates what we want to predict.
    algorithm.start() //Run the algorithm
    
    val result1 = algorithm.expectation(TRANSM.latitude, (i: Double) => i) //Compute the expectation of the number of people who buy the product
    val result2 = algorithm.expectation(TRANSM.longitude, (i: Double) => i)
    
    algorithm.kill() //Clean up and free resources taken by the algorithm
    
    println("Transmitter Latitude: " + result1)
    println("Transmitter Longitude: " + result2)
    
    // Approximate Inference
    //val importance = Importance(TRANSM.latitude)
    //importance.start()
    //Thread.sleep(1000)
    //importance.stop()

    //println(importance.distribution(TRANSM.latitude).toList) //Infer the probability that the painting is authentic.


  }
}



